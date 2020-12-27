import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { IonInfiniteScroll, ModalController, NavController, Platform } from '@ionic/angular';
import { Subscription } from 'rxjs';
// Strive
import { NotificationService } from '@strive/notification/+state/notification.service';
import { isSupportDecisionNotification } from '@strive/notification/+state/notification.model';
import { UserService } from '@strive/user/user/+state/user.service';
import { SeoService } from 'apps/journal/src/app/services/seo/seo.service';
import { NotificationPaginationService } from 'apps/journal/src/app/services/pagination/notification-pagination.service';
import { Notification } from '@strive/notification/+state/notification.firestore';
import { AuthModalPage, enumAuthSegment } from '../auth/auth-modal.page';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.page.html',
  styleUrls: ['./notifications.page.scss'],
})
export class NotificationsPage implements OnInit, OnDestroy {
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
    this.seo.generateTags({ title: `Notifications - Strive Journal` })

    this.userSubscription = this.user.profile$.subscribe(profile => {
      if (profile) {
        this.paginationService.reset()
        this.paginationService.init(`Users/${profile.id}/Notifications`, 'createdAt', { reverse: true, prepend: false })
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
      this.user.isLoggedIn$.pipe(take(1)).subscribe(isLoggedIn => {
        if (isLoggedIn) this.notificationService.resetNumberOfUnreadNotifications();
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

  async openLoginModal(): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: AuthModalPage,
      componentProps: {
        authSegment: enumAuthSegment.login
      }
    })
    await modal.present()
  }

  async doRefresh($event) {

    this.paginationService.refresh(`Users/${this.user.uid}/Notifications`, 'createdAt', { reverse: true, prepend: false })
    this.paginationService.refreshing.subscribe(refreshing => {
      if (refreshing === false) {
        setTimeout(() => {
          $event.target.complete();
        }, 500);
      }
    })

  }

  public loadData(event) {
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
