import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { IonInfiniteScroll, ModalController, NavController, Platform } from '@ionic/angular';
import { Subscription } from 'rxjs';
// Strive
import { NotificationService } from '@strive/notification/+state/notification.service';
import { isSupportDecisionNotification } from '@strive/notification/+state/notification.model';
import { UserService } from '@strive/user/user/+state/user.service';
import { SeoService } from '@strive/utils/services/seo.service';
import { NotificationPaginationService } from '@strive/notification/+state/notification-pagination.service';
import { Notification } from '@strive/notification/+state/notification.firestore';
import { AuthModalPage, enumAuthSegment } from '../auth/auth-modal.page';
import { distinctUntilChanged, take } from 'rxjs/operators';

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
    private modalCtrl: ModalController,
    private navCtrl: NavController,
    private notificationService: NotificationService,
    public paginationService: NotificationPaginationService,
    public platform: Platform,
    private seo: SeoService
  ) { }

  ngOnInit() {
    this.seo.generateTags({ title: `Home - Strive Journal` });

    this.userSubscription = this.user.profile$.pipe(
      distinctUntilChanged((a, b) => JSON.stringify(a) !== JSON.stringify(b))
    ).subscribe(profile => {
      if (profile) {
        this.paginationService.reset()
        this.paginationService.init(`Users/${profile.id}/Notifications`, 'createdAt', 20)
      } else {
        this.paginationService.reset()
      }
    })
  }

  ionViewDidEnter() {
    // TODO test if number of notifications is reset on login
    if (!!this.user.uid) {
      this.notificationService.resetNumberOfUnreadNotifications();
    } else {
      // If this is the first page after reloading, this.user.uid is not filled yet, therefore we check value on first auth trigger
      this.user.profile$.pipe(take(1)).subscribe(profile => {
        if (!!profile) this.notificationService.resetNumberOfUnreadNotifications();
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
    this.paginationService.refresh(`Users/${this.user.uid}/Notifications`, 'createdAt', 20)
    this.paginationService.refreshing.subscribe(refreshing => {
      if (refreshing === false) {
        setTimeout(() => {
          $event.target.complete();
        }, 500);
      }
    })
  }

  loadData(event) {
    this.paginationService.more()
    event.target.complete();

    if (this.paginationService.done) {
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
