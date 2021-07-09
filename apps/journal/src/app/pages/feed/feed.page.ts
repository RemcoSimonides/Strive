import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { IonInfiniteScroll, ModalController, NavController, Platform } from '@ionic/angular';
import { Subscription } from 'rxjs';
// Strive
import { isSupportDecisionNotification } from '@strive/notification/+state/notification.model';
import { UserService } from '@strive/user/user/+state/user.service';
import { SeoService } from '@strive/utils/services/seo.service';
import { FeedPaginationService } from '@strive/notification/+state/feed-pagination.service';
import { Notification } from '@strive/notification/+state/notification.firestore';
import { AuthModalPage, enumAuthSegment } from '../auth/auth-modal.page';
import { distinctUntilChanged, take, tap } from 'rxjs/operators';
import { ProfileService } from '@strive/user/user/+state/profile.service';

@Component({
  selector: 'strive-feed',
  templateUrl: './feed.page.html',
  styleUrls: ['./feed.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FeedPage implements OnInit, OnDestroy {
  @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;
  
  notifications: Notification[]

  private backBtnSubscription: Subscription
  private userSubscription: Subscription

  constructor(
    public user: UserService,
    private profile: ProfileService,
    private modalCtrl: ModalController,
    private navCtrl: NavController,
    public feed: FeedPaginationService,
    public platform: Platform,
    private seo: SeoService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.seo.generateTags({ title: `Home - Strive Journal` });

    this.userSubscription = this.user.profile$.pipe(
      distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b))
    ).subscribe(profile => {
      this.feed.reset()
      if (profile) {
        this.feed.init(`Users/${profile.id}/Notifications`)
      }
      this.cdr.markForCheck()
    })
  }

  ionViewDidEnter() {
    // TODO test if number of notifications is reset on login
    if (!!this.user.uid) {
      this.profile.resetNumberOfUnreadNotifications(this.user.uid);
    } else {
      // If this is the first page after reloading, this.user.uid is not filled yet, therefore we check value on first auth trigger
      this.user.profile$.pipe(take(1)).subscribe(profile => {
        if (!!profile) this.profile.resetNumberOfUnreadNotifications(profile.id);
      })
    }

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
