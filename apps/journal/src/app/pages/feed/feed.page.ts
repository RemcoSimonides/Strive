import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { IonInfiniteScroll, ModalController, NavController, Platform } from '@ionic/angular';
import { Observable, of, Subscription } from 'rxjs';
// Strive
import { UserService } from '@strive/user/user/+state/user.service';
import { SeoService } from '@strive/utils/services/seo.service';
import { FeedPaginationService } from '@strive/notification/+state/feed-pagination.service';
import { Notification } from '@strive/notification/+state/notification.firestore';
import { AuthModalPage, enumAuthSegment } from '@strive/user/auth/components/auth-modal/auth-modal.page';
import { map, switchMap } from 'rxjs/operators';
import { NotificationService } from '@strive/notification/+state/notification.service';
import { ScreensizeService } from '@strive/utils/services/screensize.service';
import { limit, where } from '@angular/fire/firestore';

@Component({
  selector: 'strive-feed',
  templateUrl: './feed.page.html',
  styleUrls: ['./feed.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FeedPage implements OnInit, OnDestroy {
  @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;
  
  decisions$: Observable<Notification[]>

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

    this.userSubscription = this.user.profile$.subscribe(profile => {
      if (profile) {
        this.feed.init(`Users/${profile.uid}/Notifications`)
      } else {
        this.feed.reset()
      }
      this.cdr.markForCheck()
    })

    this.decisions$ = this.user.profile$.pipe(
      switchMap(profile => profile
        ? this.notification.valueChanges([where('needsDecision', '==', true)], { uid: profile.uid })
        : of([])),
    )

    this.unreadNotifications$ = this.user.profile$.pipe(
      switchMap(profile => profile
        ? this.notification.valueChanges([where('type', '==', 'notification'), where('isRead', '==', false), limit(1)], { uid: profile.uid }).pipe(map(notifications => !!notifications.length))
        : of(false)
      )
    )
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
        authSegment: enumAuthSegment.register
      }
    }).then(modal => modal.present())
  }

  doRefresh($event) {
    this.feed.refresh(`Users/${this.user.uid}/Notifications`)
    this.feed.refreshing$.subscribe(refreshing => {
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
}