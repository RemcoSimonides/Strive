import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { ModalController, NavController, Platform } from '@ionic/angular';
import { BehaviorSubject, Observable, of, Subscription } from 'rxjs';
// Strive
import { UserService } from '@strive/user/user/+state/user.service';
import { SeoService } from '@strive/utils/services/seo.service';
import { Notification } from '@strive/notification/+state/notification.firestore';
import { AuthModalModalComponent, enumAuthSegment } from '@strive/user/auth/components/auth-modal/auth-modal.page';
import { map, switchMap } from 'rxjs/operators';
import { NotificationService } from '@strive/notification/+state/notification.service';
import { ScreensizeService } from '@strive/utils/services/screensize.service';
import { collection, endBefore, Firestore, getDocs, limit, query, Query, startAfter, where } from '@angular/fire/firestore';
import { GoalService } from '@strive/goal/goal/+state/goal.service';
import { enumExercises, exercises } from '@strive/exercises/utils';
import { PWAService } from '@strive/utils/services/pwa.service';
import { AffirmationUpsertComponent } from '@strive/exercises/affirmation/components/upsert/upsert.component';
import { DearFutureSelfUpsertComponent } from '@strive/exercises/dear-future-self/components/upsert/upsert.component';
import { DailyGratefulnessUpsertComponent } from '@strive/exercises/daily-gratefulness/components/upsert/upsert.component';
import { AssessLifeUpsertComponent } from '@strive/exercises/assess-life/components/upsert/upsert.component';
import { DocumentData } from 'rxfire/firestore/interfaces';
import { orderBy, QueryConstraint } from 'firebase/firestore';
import { createNotification } from '@strive/notification/+state/notification.model';
import { delay } from '@strive/utils/helpers';

@Component({
  selector: 'journal-feed',
  templateUrl: './feed.page.html',
  styleUrls: ['./feed.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FeedComponent implements OnDestroy {
  private notificationsPerQuery = 20
  private query: Query<DocumentData>

  private _notifications = new BehaviorSubject<Notification[]>([])
  private _done = new BehaviorSubject<boolean>(false)
  private _loading = new BehaviorSubject<boolean>(false)
  notifications$ = this._notifications.asObservable()

  enumAuthSegment = enumAuthSegment
  exercises = exercises
  
  decisions$: Observable<Notification[]>
  unreadNotifications$: Observable<boolean>

  goals$ = this.goal.valueChanges(['kWqyr9RQeroZ1QjsSmfU', 'pGvDUf2aWP7gt5EnIEjt', 'UU9oRpCmKIljnTy4JFlL', 'NJQ4AwTN7y0o7Dx0NoNB'])

  private backBtnSubscription: Subscription
  private userSubscription: Subscription

  constructor(
    private db: Firestore,
    private goal: GoalService,
    public user: UserService,
    private modalCtrl: ModalController,
    private navCtrl: NavController,
    private notification: NotificationService,
    private platform: Platform,
    private seo: SeoService,
    private cdr: ChangeDetectorRef,
    public pwa: PWAService,
    public screensize: ScreensizeService
  ) {
    this.seo.generateTags({ title: `Strive Journal` })

    this.userSubscription = this.user.user$.subscribe(user => {
      if (user) {
        const ref = collection(this.db, `Users/${user.uid}/Notifications`)
        const constraints = [
          where('type', '==', 'feed'),
          orderBy('createdAt', 'desc'),
          limit(this.notificationsPerQuery)
        ]
        this.query = query(ref, ...constraints)
        this.mapAndUpdate([])
      } else {
        this._notifications.next([])
        this._done.next(false)
      }
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
      component: AuthModalModalComponent,
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

  private async mapAndUpdate(queryConstraints: QueryConstraint[], isRefresh = false) {
    if (!isRefresh && (this._done.value || this._loading.value)) return
    this._loading.next(true)

    const snapshot = await getDocs(query(this.query, ...queryConstraints))
    if (!snapshot.empty) {
      const notifications = snapshot.docs.map(doc => {
        return createNotification({ ...doc.data(), id: doc.id })
        // return { ...data, 'discussion$': this.discussion.valueChanges(data.discussionId) }
      })
      const next = isRefresh ? [...notifications, ...this._notifications.value] : [...this._notifications.value, ...notifications]
      this._notifications.next(next)
    }
    if (!isRefresh && (snapshot.empty || snapshot.size < this.notificationsPerQuery)) this._done.next(true)
    this._loading.next(false)
  }

  async more($event) {
    const posts = this._notifications.value
    const cursor = posts[posts.length - 1].createdAt ?? null

    await Promise.race([
      delay(5000),
      this.mapAndUpdate([startAfter(cursor)])
    ])

    $event.target.complete()
    if (this._done.value) {
      $event.target.disabled = true
    }
  }

  async refresh($event) {
    const cursor = this._notifications.value[0]?.createdAt ?? null
    await Promise.race([
      delay(5000),
      this.mapAndUpdate([endBefore(cursor)], true).then(() => delay(500))
    ])
    $event.target.complete()
  }
}
