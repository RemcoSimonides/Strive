import { Component, OnInit, ViewChild } from '@angular/core';
// Ionic
import { IonInfiniteScroll, ModalController, NavController, Platform } from '@ionic/angular';
// Services
import { NotificationService } from 'apps/journal/src/app/services/notification/notification.service'
import { AuthService } from 'apps/journal/src/app/services/auth/auth.service';
// Rxjs
import { BehaviorSubject, Observable } from 'rxjs';
import { take } from 'rxjs/operators';
// Interfaces
import { enumNotificationType, enumRequestStatus } from 'apps/journal/src/app/interfaces/notification.interface';
import { enumSupportDecision } from 'apps/journal/src/app/interfaces/support.interface';
import { SeoService } from 'apps/journal/src/app/services/seo/seo.service';
import { NotificationPaginationService } from 'apps/journal/src/app/services/pagination/notification-pagination.service';
import { AuthModalPage, enumAuthSegment } from '../auth/auth-modal.page';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.page.html',
  styleUrls: ['./notifications.page.scss'],
})
export class NotificationsPage implements OnInit {
  @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;
  _pageIsLoading: boolean

  private _isLoggedIn = new BehaviorSubject(false)
  public isLoggedIn: Observable<boolean> = this._isLoggedIn.asObservable()
  
  _backBtnSubscription
  _nrOfUnreadNotifications: number = 0
  _uid: string

  public _notifications: any[]
  enumNotificationType = enumNotificationType
  enumSupportDecision = enumSupportDecision
  enumRequestStatus = enumRequestStatus

  constructor(
    public authService: AuthService,
    private _modalCtrl: ModalController,
    private navCtrl: NavController,
    private notificationService: NotificationService,
    public paginationService: NotificationPaginationService,
    public _platform: Platform,
    private _seo: SeoService
  ) { }

  ngOnInit() {

    this._pageIsLoading = true

    this._seo.generateTags({
      title: `Notifications - Strive Journal`
    })

    this.authService.user$.subscribe(user => {
      if (user) {
        this._isLoggedIn.next(true)
        this._uid = user.id;
        this.paginationService.reset()
        this.paginationService.init(`Users/${user.id}/Notifications`, 'createdAt', { reverse: true, prepend: false })
        this.paginationService.data.subscribe(data => {
        this._pageIsLoading = false
        })
      } else {
        this._isLoggedIn.next(false)
        this._pageIsLoading = false
        this.paginationService.reset()
      }

    })

    this.authService.userProfile$.pipe(take(1)).subscribe(profile => {
      if (profile) {
        if (profile.numberOfUnreadNotifications !== 0) {
          this._nrOfUnreadNotifications = profile.numberOfUnreadNotifications
        }
      }
    })


  }

  ionViewDidEnter() {
    this.isLoggedIn.subscribe(isLoggedIn => {
      if (isLoggedIn) {
        this.notificationService.resetNumberOfUnreadNotifications()
      }
    })
    if (this._platform.is('android') || this._platform.is('ios')) {
      this._backBtnSubscription = this._platform.backButton.subscribe(() => {
        this.navCtrl.navigateRoot('explore')
      });
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

    const { uid } = await this.authService.afAuth.currentUser;
    await this.paginationService.refresh(`Users/${uid}/Notifications`, 'createdAt', { reverse: true, prepend: false })

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
