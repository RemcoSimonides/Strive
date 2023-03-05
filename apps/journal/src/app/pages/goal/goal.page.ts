import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { AlertController, ModalController, PopoverController, SelectCustomEvent } from '@ionic/angular'
import { Location } from '@angular/common'
// Firebase
import { orderBy, OrderByDirection, where } from 'firebase/firestore'
import { joinWith } from 'ngfire'
// Rxjs
import { BehaviorSubject, combineLatest, Observable, of, Subscription } from 'rxjs'
import { distinctUntilChanged, map, shareReplay, switchMap, tap } from 'rxjs/operators'
// Capacitor
import { Capacitor } from '@capacitor/core'
import { Share } from '@capacitor/share'
// Sentry
import { captureException } from '@sentry/angular'
// Date fns
import { isEqual, isPast } from 'date-fns'
// Strive Utils
import { getImgIxResourceUrl } from '@strive/media/directives/imgix-helpers'
// Strive Components
import { GoalOptionsPopoverComponent, enumGoalOptions } from './popovers/options/options.component'
import { UpsertGoalModalComponent } from '@strive/goal/modals/upsert/goal-upsert.component'
import { AuthModalComponent, enumAuthSegment } from '@strive/auth/components/auth-modal/auth-modal.page'
import { ChatModalComponent } from '@strive/chat/modals/chat/chat.component'
import { FocusModalComponent } from '@strive/stakeholder/modals/upsert-focus/upsert-focus.component'
import { getEnterAnimation, getLeaveAnimation, ImageZoomModalComponent } from '@strive/ui/image-zoom/image-zoom.component'
import { AddOthersModalComponent } from './modals/add-others/add-others.component'
import { DeadlinePopoverSComponent } from '@strive/goal/popovers/deadline/deadline.component'
import { UpsertPostModalComponent } from '@strive/post/modals/upsert/post-upsert.component'
import { CollectiveGoalsModalSComponent } from '@strive/goal/modals/collective-goals/collective-goals.component'
import { AchieversModalComponent } from '@strive/stakeholder/modals/achievers/achievers.component'
import { SpectatorsModalComponent } from '@strive/stakeholder/modals/spectators/spectators.component'
import { SupportersModalComponent } from '@strive/stakeholder/modals/supporters/supporters.component'
import { GoalSharePopoverComponent } from '@strive/goal/popovers/share/share.component'
// Strive Services
import { GoalService } from '@strive/goal/goal.service'
import { GoalStakeholderService } from '@strive/stakeholder/stakeholder.service'
import { InviteTokenService } from '@strive/utils/services/invite-token.service'
import { ProfileService } from '@strive/user/profile.service'
import { AuthService } from '@strive/auth/auth.service'
import { SeoService } from '@strive/utils/services/seo.service'
import { MilestoneService } from '@strive/roadmap/milestone.service'
import { SupportService } from '@strive/support/support.service'
import { ScreensizeService } from '@strive/utils/services/screensize.service'
import { StoryService } from '@strive/story/story.service'
import { PostService } from '@strive/post/post.service'
// Strive Interfaces
import { Goal, GoalStakeholder, groupByObjective, SupportsGroupedByGoal, Milestone, StoryItem, sortGroupedSupports, createGoalStakeholder, createPost, Stakeholder } from '@strive/model'

function stakeholderChanged(before: GoalStakeholder | undefined, after: GoalStakeholder | undefined): boolean {
  if (!before || !after) return true

  const fields: (keyof GoalStakeholder)[] = [
    'isAchiever',
    'isAdmin',
    'isSupporter',
    'isSpectator',
    'hasOpenRequestToJoin',
    'lastCheckedChat'
  ]

  return fields.some(field => {
    const b = before[field]
    const a = after[field]
    if (b instanceof Date && a instanceof Date) { return !isEqual(b, a) }
    return before[field] !== after[field]
  })
}

@Component({
  selector: 'journal-goal',
  templateUrl: 'goal.page.html',
  styleUrls: ['./goal.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GoalPageComponent implements OnDestroy {

  goal: Goal | undefined
  goal$: Observable<Goal | undefined>

  stakeholder = createGoalStakeholder()
  stakeholder$: Observable<GoalStakeholder>

  collectiveStakeholder: GoalStakeholder | undefined
  collectiveStakeholders$: Observable<Stakeholder[]>

  storyOrder$ = new BehaviorSubject<OrderByDirection>('desc')
  story$: Observable<StoryItem[]>

  milestones$?: Observable<Milestone[]>

  openRequests$?: Observable<GoalStakeholder[]>

  supports$: Observable<SupportsGroupedByGoal[]>

  isMobile$ = this.screensize.isMobile$

  isLoggedIn$ = this.auth.isLoggedIn$
  canAccess$ = new BehaviorSubject(false)
  pageIsLoading$ = new BehaviorSubject(true)
  showIOSHeader$ = combineLatest([
    this.auth.isLoggedIn$,
    this.screensize.isMobile$,
    of(Capacitor.getPlatform() === 'ios')
  ]).pipe(
    map(([ isLoggedIn, isMobile, isIOS ]) => isLoggedIn && isMobile && isIOS )
  )

  private accessSubscription: Subscription

  constructor(
    private alertCtrl: AlertController,
    private auth: AuthService,
    private goalService: GoalService,
    private inviteTokenService: InviteTokenService,
    private location: Location,
    private milestoneService: MilestoneService,
    private modalCtrl: ModalController,
    private popoverCtrl: PopoverController,
    private postService: PostService,
    private profileService: ProfileService,
    private route: ActivatedRoute,
    private router: Router,
    private stakeholderService: GoalStakeholderService,
    private storyService: StoryService,
    private support: SupportService,
    private screensize: ScreensizeService,
    private seo: SeoService
  ) {
    const goalId$ = this.route.params.pipe(
      map(params => params['id'] as string),
      shareReplay({ bufferSize: 1, refCount: true })
    )

    this.goal$ = goalId$.pipe(
      switchMap(goalId => this.goalService.valueChanges(goalId)),
      tap(goal => this.goal = goal),
      shareReplay({ bufferSize: 1, refCount: true })
    )

    this.stakeholder$ = combineLatest([
      goalId$,
      this.auth.profile$
    ]).pipe(
      tap(([ goalId, profile ]) => {
        if (profile) this.stakeholderService.updateLastCheckedGoal(goalId, profile.uid)
      }),
      switchMap(([ goalId, user ]) => user ? this.stakeholderService.valueChanges(user.uid, { goalId }) : of(undefined)),
      distinctUntilChanged((a, b) => !stakeholderChanged(a, b)),
      map(stakeholder => createGoalStakeholder(stakeholder)),
      tap(stakeholder => this.stakeholder = stakeholder),
      shareReplay({ bufferSize: 1, refCount: true })
    )

    this.openRequests$ = this.stakeholder$.pipe(
      switchMap(stakeholder => {
        if (!stakeholder.isAdmin) return of([])
        return this.stakeholderService.valueChanges([where('hasOpenRequestToJoin', '==', true)], { goalId: stakeholder.goalId }).pipe(
          joinWith({
            profile: stakeholder => this.profileService.valueChanges(stakeholder.uid)
          }, { shouldAwait: true })
        )
      })
    )

    this.collectiveStakeholders$ = this.goal$.pipe(
      switchMap(goal => {
        if (!goal?.collectiveGoalId) return of([])
        const query = [
          where('collectiveGoalId', '==', goal.collectiveGoalId),
          where('isAchiever', '==', true)
        ]
        return this.stakeholderService.valueChanges(query).pipe(
          map(stakeholders => stakeholders.filter(stakeholder => stakeholder.goalId !== goal.id)),
          tap(stakeholders => this.collectiveStakeholder = stakeholders.find(stakeholder => stakeholder.uid === this.auth.uid)),
          joinWith({
            profile: stakeholder => this.profileService.valueChanges(stakeholder.uid),
            goal: stakeholder => this.goalService.valueChanges(stakeholder.goalId)
          }, { shouldAwait: true })
        )
      })
    )

    this.story$ = combineLatest([goalId$, this.storyOrder$]).pipe(
      switchMap(([goalId, order]) => goalId ? this.storyService.valueChanges([orderBy('date', order)], { goalId }) : of([])),
      joinWith({
        user: ({ userId }) => userId ? this.profileService.valueChanges(userId) : of(undefined),
        milestone: ({ milestoneId, goalId }) => milestoneId ? this.milestoneService.valueChanges(milestoneId, { goalId }) : of(undefined),
        post: ({ postId, goalId }) => postId ? this.postService.valueChanges(postId, { goalId }) : of(undefined)
      }),
      shareReplay({ bufferSize: 1, refCount: true })
    )

    const supports$ = combineLatest([
      this.auth.profile$,
      goalId$
    ]).pipe(
      switchMap(([ profile, goalId ]) => {
        if (!profile) return of([[], []])
        return combineLatest([
          this.support.valueChanges([where('supporterId', '==', profile.uid)], { goalId }),
          this.support.valueChanges([where('recipientId', '==', profile.uid)], { goalId })
        ])
      }),
      map(([ supporter, recipient ]) => [...supporter, ...recipient ]),
      map(supports => supports.filter((support, index) => supports.findIndex(s => s.id === support.id) === index)), // remove duplicates (when user is both supporter and recipient)
      joinWith({
        goal: () => this.goal,
        milestone: ({ milestoneId, goalId  }) => milestoneId ? this.milestoneService.valueChanges(milestoneId, { goalId }) : of(undefined),
        recipient: ({ recipientId }) => this.profileService.valueChanges(recipientId),
        supporter: ({ supporterId }) => this.profileService.valueChanges(supporterId)
      }, { shouldAwait: true }),
      shareReplay({ bufferSize: 1, refCount: true })
    )

    this.supports$ = supports$.pipe(map(groupByObjective), map(sortGroupedSupports))

    this.milestones$ = goalId$.pipe(
      switchMap(goalId => this.milestoneService.valueChanges([where('deletedAt', '==', null), orderBy('order', 'asc')], { goalId }).pipe(
        joinWith({
          achiever: ({ achieverId }) => achieverId ? this.profileService.valueChanges(achieverId) : undefined,
          supports: milestone => supports$.pipe(
            map(supports => supports.filter(support => support.milestoneId === milestone.id))
          ),
          story: milestone => this.story$.pipe(
            map(story => story.filter(item => item.post && item.milestoneId === milestone.id))
          )
        },{ shouldAwait: false })
      ))
    )

    this.accessSubscription = combineLatest([
      this.goal$,
      this.stakeholder$
    ]).pipe(
      map(async ([ goal, stakeholder ]) => {
        if (!goal) return { access: false, goal }
        if (goal.publicity === 'public') return { access: true, goal }
        const { isAdmin, isAchiever, isSupporter, isSpectator, hasInviteToJoin } = stakeholder
        if (isAdmin || isAchiever || isSupporter || isSpectator || hasInviteToJoin ) return { access: true, goal }
        const access = await this.inviteTokenService.checkInviteToken(goal.id)
        return { access, goal }
      })
    ).subscribe(async promise => {
      const { goal, access } = await promise
      if (access && goal) {
        this.canAccess$.next(true)
        this.pageIsLoading$.next(false)

        this.seo.generateTags({
          title: `${goal.title} - Strive Journal`,
          description: goal.description ? goal.description : `Check the plan, follow the progress, chat with the team, and help out wherever you can`,
          image: goal.image ? getImgIxResourceUrl(goal.image) : undefined
        })
      } else {
        this.pageIsLoading$.next(false)
        this.canAccess$.next(false)
      }
    })
  }

  ngOnDestroy() {
    this.accessSubscription.unsubscribe()
  }

  async presentGoalOptionsPopover(event: UIEvent, goal: Goal) {
    const popover = await this.popoverCtrl.create({
      component: GoalOptionsPopoverComponent,
      event,
      componentProps: {
        stakeholder: this.stakeholder,
        goal: this.goal
      }
    })
    await popover.present()
    await popover.onDidDismiss().then((data) => {
      switch (data.data) {
        case enumGoalOptions.openFocusModal:
          this.openFocusModal()
          break
        case enumGoalOptions.editNotificationSettings:
          console.warn('not supported yet')
          break
        case enumGoalOptions.editGoal:
          this.editGoal(goal)
          break
        case enumGoalOptions.deleteGoal:
          this.deleteGoal()
      }
    })
  }

  updateDescription(description: string) {
    if (!this.goal?.id) return
    this.goalService.update(this.goal.id, { description })
  }

  updatePrivacy($event: SelectCustomEvent, goal: Goal) {
    if (!this.goal?.id) return
    if (!this.stakeholder.isAdmin) return

    const publicity = $event.detail.value
    if (publicity === goal.publicity) return
    this.goalService.update({ id: this.goal.id, publicity })
  }

  private editGoal(goal: Goal) {
    this.modalCtrl.create({
      component: UpsertGoalModalComponent,
      componentProps: { goal }
    }).then(modal => modal.present())
  }

  private deleteGoal() {
    this.alertCtrl.create({
      subHeader: `Are you sure you want to delete this goal?`,
      message: `This action is irreversible`,
      buttons: [
        {
          text: 'Yes',
          handler: async () => {
            if (!this.goal?.id) return
            await this.goalService.remove(this.goal.id)
            this.router.navigate(['/goals'])
            this.seo.generateTags({ title: `Goals - Strive Journal` })
          }
        },
        {
          text: 'No',
          role: 'cancel'
        }
      ]
    }).then(alert => alert.present())
  }

  async spectate() {
    if (!this.goal?.id) return

    if (!this.auth.uid) {
      const modal = await this.modalCtrl.create({
        component: AuthModalComponent,
        componentProps: {
          authSegment: enumAuthSegment.login
        }
      })
      modal.onDidDismiss().then(({ data: loggedIn }) => {
        if (loggedIn) this.spectate()
      })
      return modal.present()
    }

    const { isSpectator } = this.stakeholder
    const goalId = this.goal.id

    return this.stakeholderService.upsert({
      uid: this.auth.uid,
      goalId,
      isSpectator: !isSpectator
    }, { params: { goalId }})
  }


  openTeamModal(role: keyof GoalStakeholder) {
    if (!this.goal?.id) return

    const component = role === 'isAchiever'
      ? AchieversModalComponent
      : role === 'isSpectator'
        ? SpectatorsModalComponent
        : SupportersModalComponent

    this.modalCtrl.create({
      component,
      componentProps: {
        goalId: this.goal.id,
        role: role ? role : null
      }
    }).then(modal => modal.present())
  }

  openCollectiveGoals(stakeholders: GoalStakeholder[]) {
    if (!this.goal?.id) return

    this.modalCtrl.create({
      component: CollectiveGoalsModalSComponent,
      componentProps: {
        goal: this.goal,
        stakeholders
      }
    }).then(modal => modal.present())
  }

  openFocusModal() {
    this.modalCtrl.create({
      component: FocusModalComponent,
      componentProps: {
        stakeholder: this.stakeholder
      }
    }).then(modal => modal.present())
  }


  openAddOthersModal() {
    this.modalCtrl.create({
      component: AddOthersModalComponent,
      componentProps: {
        goal: this.goal,
        stakeholder: this.stakeholder
      }
    }).then(modal => modal.present())
  }

  async openShare(event: Event) {
    if (!this.goal || !this.stakeholder) return

    const isSecret = this.goal.publicity !== 'public'
    const url = await this.inviteTokenService.getShareLink(this.goal.id, isSecret, this.stakeholder.isAdmin)

    const canShare = await Share.canShare()
    if (canShare.value) {
      Share.share({
        title: this.goal.title,
        text: 'Check out this goal',
        url,
        dialogTitle: 'Together we achieve!'
      }).catch(err => {
        captureException(err)
      })
    } else {
      this.popoverCtrl.create({
        component: GoalSharePopoverComponent,
        event,
        componentProps: { url }
      }).then(popover => popover.present())
    }
  }

  saveDescription(description: string) {
    if (!this.goal?.id) return
    return this.goalService.updateDescription(this.goal.id, description)
  }

  isOverdue(deadline: Date) {
    return isPast(deadline)
  }

  async openDatePicker(event: Event) {
    if (!this.stakeholder.isAdmin && !this.stakeholder.isAchiever) return
    event.stopPropagation()

    const popover = await this.popoverCtrl.create({
      component: DeadlinePopoverSComponent,
      event
    })
    popover.onDidDismiss().then(({ data }) => {
      if (!this.goal) return
      if (data) {
        this.goalService.update(this.goal.id, { deadline: data })
      }
    })
    popover.present()
  }

  finishGoal(status: Goal['status']) {
    if (!this.stakeholder.isAdmin) return
    if (!this.goal) return
    this.goalService.update(this.goal.id, { status })

    this.modalCtrl.create({
      component: UpsertPostModalComponent,
      componentProps: {
        post: createPost({
          id: this.goal.id,
          goalId: this.goal.id
        })
      }
    }).then(modal => modal.present())
  }

  handleRequestDecision(stakeholder: GoalStakeholder, isAccepted: boolean, $event: UIEvent) {
    if (!this.goal?.id) return
    $event.stopPropagation()
    this.stakeholderService.update({
      uid: stakeholder.uid,
      isAchiever: isAccepted,
      hasOpenRequestToJoin: false
    }, { params: { goalId: this.goal.id }})
  }

  navTo(uid: string) {
    this.router.navigate(['/profile/', uid])
  }

  openZoom(goal: Goal) {
    this.modalCtrl.create({
      component: ImageZoomModalComponent,
      componentProps: {
        ref: goal.image,
        asset: 'goal.png'
      },
      enterAnimation: getEnterAnimation,
      leaveAnimation: getLeaveAnimation
    }).then(modal => modal.present())
  }

  openChat() {
    this.modalCtrl.create({
      component: ChatModalComponent,
      componentProps: {
        goal: this.goal,
        collectiveStakeholder: this.collectiveStakeholder
      }
    }).then(modal => modal.present())
  }

  back() {
    const state = this.location.getState() as { navigationId: number}

    if (state?.navigationId === 1) {
      this.router.navigateByUrl('/')
    } else {
      this.location.back()
    }
  }

  toggleStoryOrder() {
    const order: OrderByDirection = this.storyOrder$.value === 'desc' ? 'asc' : 'desc'
    this.storyOrder$.next(order)
  }
}