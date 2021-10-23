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
import { GoalService } from '@strive/goal/goal/+state/goal.service';
import { exercises } from '@strive/exercises/utils';
import { PWAService } from '@strive/utils/services/pwa.service';
import { CollectiveGoalService } from '@strive/collective-goal/collective-goal/+state/collective-goal.service';

@Component({
  selector: 'strive-feed',
  templateUrl: './feed.page.html',
  styleUrls: ['./feed.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FeedPage implements OnInit, OnDestroy {
  @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;
  enumAuthSegment = enumAuthSegment
  
  decisions$: Observable<Notification[]>
  unreadNotifications$: Observable<boolean>

  goals$ = this.goal.valueChanges(['kWqyr9RQeroZ1QjsSmfU', 'pGvDUf2aWP7gt5EnIEjt', 'UU9oRpCmKIljnTy4JFlL', 'NJQ4AwTN7y0o7Dx0NoNB'])
  collectiveGoals$ = this.collectiveGoal.valueChanges(['lidJJc63GYEL499jfnei', 'ZwHs8v6Fivgeb53Wpr6v', 'REsVPNUXsbIAUyBJsGZB', 'XGtfe77pCKh1QneOipI7'])
  exercises = exercises

  private backBtnSubscription: Subscription
  private userSubscription: Subscription

  constructor(
    private collectiveGoal: CollectiveGoalService,
    private goal: GoalService,
    public user: UserService,
    private modalCtrl: ModalController,
    private navCtrl: NavController,
    public feed: FeedPaginationService,
    private notification: NotificationService,
    private platform: Platform,
    private seo: SeoService,
    private cdr: ChangeDetectorRef,
    public pwa: PWAService,
    public screensize: ScreensizeService
  ) { }

  ngOnInit() {
    this.seo.generateTags({ title: `Strive Journal` });

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

  openAuthModal(segment: enumAuthSegment) {
    this.modalCtrl.create({
      component: AuthModalPage,
      componentProps: {
        authSegment: segment
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
