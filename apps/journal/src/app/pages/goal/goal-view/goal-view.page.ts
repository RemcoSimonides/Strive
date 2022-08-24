import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router'
// Ionic
import { ModalController, NavController, Platform } from '@ionic/angular'
// Rxjs
import { Subscription, of, Observable, combineLatest, firstValueFrom } from 'rxjs';
import { map, shareReplay, switchMap, tap } from 'rxjs/operators';
// Services
import { GoalService } from '@strive/goal/goal/goal.service';
import { GoalStakeholderService } from '@strive/goal/stakeholder/stakeholder.service';
import { InviteTokenService } from '@strive/utils/services/invite-token.service';
import { SeoService } from '@strive/utils/services/seo.service';
import { UserService } from '@strive/user/user/user.service';
// Interfaces
import { Goal, createGoalStakeholder } from '@strive/model'
// Components
import { UpsertPostModalComponent } from '@strive/post/components/upsert-modal/upsert-modal.component';

@Component({
  selector: 'journal-goal-view',
  templateUrl: './goal-view.page.html',
  styleUrls: ['./goal-view.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GoalViewComponent implements OnInit, OnDestroy {
  pageIsLoading = true
  canAccess = false

  goalId$?: Observable<string>
  goal$?: Observable<Goal | undefined>
  isAdmin$?: Observable<boolean>

  isLoggedIn$ = this.user.isLoggedIn$

  segmentChoice: 'goal' | 'roadmap' | 'story' = 'goal'

  backBtnSubscription?: Subscription
  accessSubscription?: Subscription

  constructor(
    private cdr: ChangeDetectorRef,
    private user: UserService,
    private goalService: GoalService,
    public stakeholder: GoalStakeholderService,
    private inviteTokenService: InviteTokenService,
    private modalCtrl: ModalController,
    private navCtrl: NavController,
    private platform: Platform,
    private route: ActivatedRoute,
    private seo: SeoService
  ) {}

  async ngOnInit() {
    this.goalId$ = this.route.params.pipe(
      map(params => params['id']),
      shareReplay({ bufferSize: 1, refCount: true })
    )

    this.goal$ = this.goalId$.pipe(
      switchMap(goalId => this.goalService.valueChanges(goalId)),
      shareReplay({ bufferSize: 1, refCount: true })
    )

    const stakeholder$ = combineLatest([
      this.goalId$,
      this.user.user$
    ]).pipe(
      tap(([ goalId, user ]) => {
        if (user) this.stakeholder.updateLastCheckedGoal(goalId, user.uid)
      }),
      switchMap(([ goalId, user ]) => user ? this.stakeholder.valueChanges(user.uid, { goalId }) : of(createGoalStakeholder()))
    )

    this.isAdmin$ = stakeholder$.pipe(
      map(stakeholder => !!stakeholder?.isAdmin)
    )

    this.accessSubscription = combineLatest([
      this.goal$,
      stakeholder$
    ]).pipe(
      map(async ([ goal, stakeholder ]) => {
        if (!goal) return { access: false, goal }
        if (goal.publicity === 'public') return { access: true, goal }
        const { isAdmin, isAchiever, isSupporter, isSpectator } = createGoalStakeholder(stakeholder)
        if (isAdmin || isAchiever || isSupporter || isSpectator) return { access: true, goal }
        const access = await this.inviteTokenService.checkInviteToken(goal.id)
        return { access, goal }
      })
    ).subscribe(async promise => {
      const { goal, access } = await promise
      access && goal ? this.initGoal(goal) : this.initNoAccess()
    })

    const { t } = this.route.snapshot.queryParams;
    this.segmentChoice = ['goal', 'roadmap', 'story'].includes(t) ? t : 'goal'
  }

  ngOnDestroy() {
    this.accessSubscription?.unsubscribe()
  }

  private initGoal(goal: Goal) {
    this.canAccess = true
    this.pageIsLoading = false
    this.cdr.markForCheck()
  
    this.seo.generateTags({
      title: `${goal.title} - Strive Journal`,
      image: goal.image
    })
  }

  private initNoAccess() {
    this.pageIsLoading = false
    this.canAccess = false
    this.cdr.markForCheck()

    this.seo.generateTags({ title: `Page not found - Strive Journal` })
  }

  ionViewDidEnter() {
    if (this.platform.is('android') || this.platform.is('ios')) {
      this.backBtnSubscription = this.platform.backButton.subscribe(() => {
        this.navCtrl.back();
      });
    }
  }

  ionViewWillLeave() {
    if (this.platform.is('android') || this.platform.is('ios')) {
      this.backBtnSubscription?.unsubscribe();
    }
  }

  public segmentChanged(ev: CustomEvent) {
    this.segmentChoice = ev.detail.value
  }

  async createCustomPost() {
    if (!this.goal$) return
    const goal = await firstValueFrom(this.goal$)
    this.modalCtrl.create({
      component: UpsertPostModalComponent,
      componentProps: {
        goalId: goal?.id,
        postId: undefined
      }
    }).then(modal => modal.present())
  }
}
