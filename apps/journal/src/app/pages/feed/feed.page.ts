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
import { enumExercises, exercises } from '@strive/exercises/utils';
import { PWAService } from '@strive/utils/services/pwa.service';
import { CollectiveGoalService } from '@strive/collective-goal/collective-goal/+state/collective-goal.service';
import { AffirmationUpsertComponent } from '@strive/exercises/affirmation/components/upsert/upsert.component';
import { DearFutureSelfUpsertComponent } from '@strive/exercises/dear-future-self/components/upsert/upsert.component';
import { DailyGratefulnessUpsertComponent } from '@strive/exercises/daily-gratefulness/components/upsert/upsert.component';
import { AssessLifeUpsertComponent } from '@strive/exercises/assess-life/components/upsert/upsert.component';

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
  collectiveGoals$ = this.collectiveGoal.valueChanges(['NG03OJqJNB0ZmiYyVdkK', 'Heax8uzGOWcnooaDePkJ', 'rFGdiK8iIWwMPXGZ6OWM', 'XGtfe77pCKh1QneOipI7'])
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
    
    this.userSubscription = this.user.user$.subscribe(user => {
      user ? this.feed.init(`Users/${user.uid}/Notifications`) : this.feed.reset()
      this.cdr.markForCheck()
    })

    this.decisions$ = this.user.user$.pipe(
      switchMap(user => user
        ? this.notification.valueChanges([where('needsDecision', '==', true)], { uid: user.uid })
        : of([])),
    )

    this.unreadNotifications$ = this.user.user$.pipe(
      switchMap(user => user
        ? this.notification.valueChanges([where('type', '==', 'notification'), where('isRead', '==', false), limit(1)], { uid: user.uid }).pipe(map(notifications => !!notifications.length))
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

  async openAuthModal(segment: enumAuthSegment, exercise?: enumExercises) {
    const modal = await this.modalCtrl.create({
      component: AuthModalPage,
      componentProps: {
        authSegment: segment
      }
    })
    modal.onDidDismiss().then(({ data: loggedIn }) => {
      if (loggedIn && exercise) {
        let component
        switch (exercise) {
          case enumExercises.affirmations:
            component = AffirmationUpsertComponent
            break
          case enumExercises.dear_future_self:
            component = DearFutureSelfUpsertComponent
            break
          case enumExercises.daily_gratefulness:
            component = DailyGratefulnessUpsertComponent
            break
          case enumExercises.assess_life:
            component = AssessLifeUpsertComponent
            break
        }
        this.modalCtrl.create({ component }).then(modal => modal.present())
      }
    })
    modal.present()
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
