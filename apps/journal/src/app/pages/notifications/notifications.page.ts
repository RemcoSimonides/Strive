import { Component, OnInit, ViewChild } from '@angular/core';
// Ionic
import { IonInfiniteScroll, ModalController, NavController, Platform } from '@ionic/angular';
// Services
import { NotificationService } from 'apps/journal/src/app/services/notification/notification.service'
import { UserService } from '@strive/user/user/+state/user.service';
import { SeoService } from 'apps/journal/src/app/services/seo/seo.service';
import { NotificationPaginationService } from 'apps/journal/src/app/services/pagination/notification-pagination.service';
// Rxjs
import { take } from 'rxjs/operators';
// Interfaces
import {
  enumNotificationType,
  enumRequestStatus,
  enumSupportDecision,
} from '@strive/interfaces';
// Components
import { AuthModalPage, enumAuthSegment } from '../auth/auth-modal.page';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.page.html',
  styleUrls: ['./notifications.page.scss'],
})
export class NotificationsPage implements OnInit {
  @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;
  _pageIsLoading: boolean
  
  _backBtnSubscription

  public _notifications: any[]
  enumNotificationType = enumNotificationType
  enumSupportDecision = enumSupportDecision
  enumRequestStatus = enumRequestStatus

  constructor(
    public user: UserService,
    private _modalCtrl: ModalController,
    private navCtrl: NavController,
    private notificationService: NotificationService,
    public paginationService: NotificationPaginationService,
    public _platform: Platform,
    private _seo: SeoService
  ) { }

  ngOnInit() {

    this._pageIsLoading = true

    this._seo.generateTags({ title: `Notifications - Strive Journal` })

    this.user.profile$.subscribe(profile => {
      if (profile) {
        this.paginationService.reset()
        this.paginationService.init(`Users/${profile.id}/Notifications`, 'createdAt', { reverse: true, prepend: false })
        this.paginationService.data.subscribe(data => {
          this._pageIsLoading = false
        })
      } else {
        this._pageIsLoading = false
        this.paginationService.reset()
      }
    })
  }

  ionViewDidEnter() {
    // TODO test if number of notifications is reset on login
    if (this.user.uid) {
      this.notificationService.resetNumberOfUnreadNotifications();
    }

    if (this._platform.is('android') || this._platform.is('ios')) {
      this._backBtnSubscription = this._platform.backButton.subscribe(() => this.navCtrl.navigateRoot('explore'));
    }
  }

  ionViewWillLeave() {
    if (this._platform.is('android') || this._platform.is('ios')) {
      this._backBtnSubscription.unsubscribe();
    }
  }

  async openLoginModal(): Promise<void> {
    const modal = await this._modalCtrl.create({
      component: AuthModalPage,
      componentProps: {
        authSegment: enumAuthSegment.login
      }
    })
    await modal.present()
  }

  async doRefresh($event) {

    await this.paginationService.refresh(`Users/${this.user.uid}/Notifications`, 'createdAt', { reverse: true, prepend: false })

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

  public async _toggleSupportDecision(notificationId: string, supportId: string): Promise<void> {

    const notificationIndex = this._notifications.findIndex(notification => notification.id == notificationId)
    const supportIndex = this._notifications[notificationIndex].supports.findIndex(support => support.id == supportId)

    if (this._notifications[notificationIndex].supports[supportIndex].decision == enumSupportDecision.give) {
      this._notifications[notificationIndex].supports[supportIndex].decision = enumSupportDecision.keep
    } else {
      this._notifications[notificationIndex].supports[supportIndex].decision = enumSupportDecision.give
    }

  }

  public async _toggleUnfinishedMilestoneSupportDecision(notificationId: string, supportId: string): Promise<void> {

    const notificationIndex = this._notifications.findIndex(notification => notification.id == notificationId)
    const supportIndex = this._notifications[notificationIndex].unfinishedMilestonesSupports.findIndex(support => support.id == supportId)

    if (this._notifications[notificationIndex].unfinishedMilestonesSupports[supportIndex].decision == enumSupportDecision.give) {
      this._notifications[notificationIndex].unfinishedMilestonesSupports[supportIndex].decision = enumSupportDecision.keep
    } else {
      this._notifications[notificationIndex].unfinishedMilestonesSupports[supportIndex].decision = enumSupportDecision.give
    }

  }

}
