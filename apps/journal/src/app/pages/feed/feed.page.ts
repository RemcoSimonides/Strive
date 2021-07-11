import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { IonInfiniteScroll, ModalController, NavController, Platform } from '@ionic/angular';
import { Observable, of, Subscription } from 'rxjs';
// Strive
import { isSupportDecisionNotification } from '@strive/notification/+state/notification.model';
import { UserService } from '@strive/user/user/+state/user.service';
import { SeoService } from '@strive/utils/services/seo.service';
import { FeedPaginationService } from '@strive/notification/+state/feed-pagination.service';
import { Notification } from '@strive/notification/+state/notification.firestore';
import { AuthModalPage, enumAuthSegment } from '../auth/auth-modal.page';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { NotificationService } from '@strive/notification/+state/notification.service';
import { ScreensizeService } from '@strive/utils/services/screensize.service';

@Component({
  selector: 'strive-feed',
  templateUrl: './feed.page.html',
  styleUrls: ['./feed.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FeedPage implements OnInit, OnDestroy {
  @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;
  
  notifications: Notification[]

  unreadNotifications$: Observable<boolean>

  private backBtnSubscription: Subscription
  private userSubscription: Subscription

  constructor(
    public user: UserService,
    private modalCtrl: ModalController,
    private navCtrl: NavController,
    public feed: FeedPaginationService,
    private notification: NotificationService,
    public platform: Platform,
    private seo: SeoService,
    private cdr: ChangeDetectorRef,
    public screensize: ScreensizeService
  ) { }

  ngOnInit() {
    this.seo.generateTags({ title: `Home - Strive Journal` });

    this.userSubscription = this.user.profile$.pipe(
      distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b))
    ).subscribe(profile => {
      this.feed.reset()

      if (profile) {
        this.feed.init(`Users/${profile.id}/Notifications`)
        this.unreadNotifications$ = this.notification.valueChanges(ref => ref.where('type', '==', 'notification').where('isRead', '==', false).limit(1), { uid: profile.id }).pipe(
          map(notifications => !!notifications.length)
        )
      } else { 
        this.unreadNotifications$ = of(false)
      }
      this.cdr.markForCheck()
    })
  }

  ionViewDidEnter() {
    if (this.platform.is('android') || this.platform.is('ios')) {
      this.backBtnSubscription = this.platform.backButton.subscribe(() => this.navCtrl.navigateRoot('explore'))
    }
  }

  ionViewWillLeave() {
    if (this.platform.is('android') || this.platform.is('ios')) {
      this.backBtnSubscription.unsubscribe()
    }
  }

  ngOnDestroy() {
    this.userSubscription.unsubscribe()
  }

  openLoginModal() {
    this.modalCtrl.create({
      component: AuthModalPage,
      componentProps: {
        authSegment: enumAuthSegment.login
      }
    }).then(modal => modal.present())
  }

  doRefresh($event) {
    this.feed.refresh(`Users/${this.user.uid}/Notifications`)
    this.feed.refreshing.subscribe(refreshing => {
      if (refreshing === false) {
        setTimeout(() => {
          $event.target.complete();
        }, 500);
      }
    })
  }

  loadData(event) {
    this.feed.more()
    event.target.complete();

    if (this.feed.done) {
      event.target.disabled = true
    }
  }

  public async toggleSupportDecision(notificationId: string, supportId: string): Promise<void> {
    const notification = this.notifications.find(notification => notification.id == notificationId)
    if (isSupportDecisionNotification(notification)) {
      const support = notification.meta.supports.find(support => support.id === supportId)
      support.decision = support.decision === 'give' ? 'keep' : 'give'
    }
  }

}
