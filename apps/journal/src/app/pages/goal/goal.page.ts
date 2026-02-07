import { ChangeDetectionStrategy, Component, OnDestroy, inject } from '@angular/core'
import { ActivatedRoute, Router, RouterModule } from '@angular/router'
import { CommonModule, Location } from '@angular/common';

import { AlertController, IonFab, IonFabButton, IonIcon, IonContent, IonButton, IonSelect, IonSelectOption, IonCard, IonList, IonItem, IonAvatar, IonLabel, ModalController, PopoverController, SelectCustomEvent } from '@ionic/angular/standalone'
import { addIcons } from 'ionicons'
import { arrowBack, checkmarkOutline, notificationsOutline, chatbubblesOutline, personAddOutline, shareSocialOutline, ellipsisHorizontalOutline, flag, notifications, link, lockOpenOutline, lockClosedOutline, timerOutline, closeOutline, arrowDownOutline, arrowUpOutline, sparklesOutline } from 'ionicons/icons'

// Firebase
import { orderBy, OrderByDirection, where } from '@angular/fire/firestore'
import { joinWith } from '@strive/utils/firebase'
// Rxjs
import { BehaviorSubject, combineLatest, firstValueFrom, Observable, of, Subscription } from 'rxjs'
import { distinctUntilChanged, filter, map, shareReplay, switchMap, tap } from 'rxjs/operators'
// Capacitor
import { Capacitor } from '@capacitor/core'
import { Share } from '@capacitor/share'
import { Browser } from '@capacitor/browser'
// Sentry
import { captureException } from '@sentry/angular'
// Date fns
import { isEqual, isPast } from 'date-fns'
// Strive Utils
import { getImgIxResourceUrl } from '@strive/media/directives/imgix-helpers'
// Strive Directives
import { ImageDirective } from '@strive/media/directives/image.directive'
// Strive Pipes
import { CompactPipe } from '@strive/utils/pipes/compact.pipe'
// Strive Components
import { GoalOptionsPopoverComponent, enumGoalOptions } from './popovers/options/options.component'
import { GoalUpdateModalComponent } from '@strive/goal/modals/upsert/update/update.component'
import { AuthModalComponent, enumAuthSegment } from '@strive/auth/components/auth-modal/auth-modal.page'
import { ChatModalComponent } from '@strive/chat/modals/chat/chat.component'
import { getEnterAnimation, getLeaveAnimation, ImageZoomModalComponent } from '@strive/ui/image-zoom/image-zoom.component'
import { AddOthersModalComponent } from './modals/add-others/add-others.component'
import { DeadlinePopoverComponent } from '@strive/goal/popovers/deadline/deadline.component'
import { UpsertPostModalComponent } from '@strive/post/modals/upsert/post-upsert.component'
import { CollectiveGoalsModalComponent } from '@strive/goal/modals/collective-goals/collective-goals.component'
import { AchieversModalComponent } from '@strive/stakeholder/modals/achievers/achievers.component'
import { SpectatorsModalComponent } from '@strive/stakeholder/modals/spectators/spectators.component'
import { SupportersModalComponent } from '@strive/stakeholder/modals/supporters/supporters.component'
import { RemindersModalComponent } from '@strive/stakeholder/modals/reminders/reminders.component'
import { GoalSharePopoverComponent } from '@strive/goal/popovers/share/share.component'
import { SuggestionModalComponent } from '@strive/ui/suggestion/modal/suggestion-modal.component'
import { RoadmapComponent } from '@strive/roadmap/components/roadmap/roadmap.component'
import { StoryComponent } from '@strive/story/components/story/story.component'
import { DescriptionComponent } from '@strive/ui/description/description.component'
import { JoinButtonComponent } from '@strive/goal/components/join-button/join-button.component'
import { SupportListComponent } from '@strive/support/components/list/list.component'
import { AddSupportComponent } from '@strive/support/components/add/add.component'
import { PageLoadingComponent } from '@strive/ui/page-loading/page-loading.component'
import { PagenotfoundComponent } from '@strive/ui/404/404.component'
import { HeaderRootComponent } from '@strive/ui/header-root/header-root.component'
import { StravaActivityTypesComponent } from '@strive/goal/components/strava-activity-types/strava-activity-types.component'
import { StravaCardComponent } from '@strive/strava/components/strava-card/strava-card.component'
import { IntegrationsComponent } from '@strive/goal/modals/integrations/integrations.component'
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
import { MediaService } from '@strive/media/media.service'
import { CommentService } from '@strive/chat/comment.service'
import { PersonalService } from '@strive/user/personal.service'
import { StravaService } from '@strive/strava/strava.service'
// Strive Interfaces
import { Goal, GoalStakeholder, groupByObjective, SupportsGroupedByGoal, Milestone, StoryItem, sortGroupedSupports, createGoalStakeholder, createPost, Stakeholder, createMedia, User } from '@strive/model'
import { createStravaAuthParams, StravaAuthParams, StravaIntegration } from 'libs/model/src/lib/strava'
import { getFunctions, httpsCallable } from 'firebase/functions'
import { toObservable } from '@angular/core/rxjs-interop';

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
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        CommonModule,
        RouterModule,
        ImageDirective,
        CompactPipe,
        RoadmapComponent,
        StoryComponent,
        DescriptionComponent,
        JoinButtonComponent,
        SupportListComponent,
        AddSupportComponent,
        PageLoadingComponent,
        PagenotfoundComponent,
        HeaderRootComponent,
        StravaCardComponent,
        IonFab,
        IonFabButton,
        IonIcon,
        IonContent,
        IonButton,
        IonSelect,
        IonSelectOption,
        IonCard,
        IonList,
        IonItem,
        IonAvatar,
        IonLabel
    ]
})
export class GoalPageComponent implements OnDestroy {
  private alertCtrl = inject(AlertController);
  private auth = inject(AuthService);
  private commentService = inject(CommentService);
  private goalService = inject(GoalService);
  private inviteTokenService = inject(InviteTokenService);
  private location = inject(Location);
  private mediaService = inject(MediaService);
  private milestoneService = inject(MilestoneService);
  private modalCtrl = inject(ModalController);
  private personalService = inject(PersonalService);
  private popoverCtrl = inject(PopoverController);
  private postService = inject(PostService);
  private profileService = inject(ProfileService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private stakeholderService = inject(GoalStakeholderService);
  private stravaService = inject(StravaService);
  private storyService = inject(StoryService);
  private support = inject(SupportService);
  screensize = inject(ScreensizeService);
  private seo = inject(SeoService);


  goal: Goal | undefined
  goal$: Observable<Goal | undefined>

  stakeholder = createGoalStakeholder()
  stakeholder$: Observable<GoalStakeholder>

  collectiveStakeholder: GoalStakeholder | undefined
  collectiveStakeholders$: Observable<Stakeholder[]>

  storyOrder$ = new BehaviorSubject<OrderByDirection>('desc')
  story$: Observable<StoryItem[]>
  stravaIntegrations$?: Observable<(StravaIntegration & { profile: User })[]>

  roadmapOrder$ = new BehaviorSubject<OrderByDirection>('asc')
  milestones$?: Observable<Milestone[]>

  openRequests$?: Observable<Stakeholder[]>

  supports$: Observable<SupportsGroupedByGoal[]>

  missedMessages$: Observable<number>

  isMobile$ = this.screensize.isMobile$

  isLoggedIn = this.auth.isLoggedIn
  canAccess$ = new BehaviorSubject(false)
  pageIsLoading$ = new BehaviorSubject(true)
  showIOSHeader$ = combineLatest([
    toObservable(this.auth.isLoggedIn),
    this.screensize.isMobile$,
    of(Capacitor.getPlatform() === 'ios')
  ]).pipe(
    map(([isLoggedIn, isMobile, isIOS]) => isLoggedIn && isMobile && isIOS)
  )

  stravaParams$ = this.route.queryParams.pipe(
    map(params => createStravaAuthParams(params)),
    filter(params => !!params.code),
    shareReplay({ bufferSize: 1, refCount: true })
  ).subscribe(params => {
    this.integrateStrava(params)
  })

  private accessSubscription: Subscription

  constructor() {
    const goalId$ = this.route.params.pipe(
      map(params => params['id'] as string),
      shareReplay({ bufferSize: 1, refCount: true })
    )

    this.goal$ = goalId$.pipe(
      switchMap(goalId => this.goalService.docData(goalId)),
      tap(goal => this.goal = goal),
      shareReplay({ bufferSize: 1, refCount: true })
    )

    this.stakeholder$ = combineLatest([
      goalId$,
      this.auth.profile$
    ]).pipe(
      tap(([goalId, profile]) => {
        if (profile) this.stakeholderService.updateLastCheckedGoal(goalId, profile.uid)
      }),
      switchMap(([goalId, user]) => user ? this.stakeholderService.docData(user.uid, { goalId }) : of(undefined)),
      distinctUntilChanged((a, b) => !stakeholderChanged(a, b)),
      map(stakeholder => createGoalStakeholder(stakeholder)),
      tap(stakeholder => this.stakeholder = stakeholder),
      shareReplay({ bufferSize: 1, refCount: true })
    )

    this.openRequests$ = this.stakeholder$.pipe(
      switchMap(stakeholder => {
        if (!stakeholder.isAdmin) return of([])
        return this.stakeholderService.collectionData([where('hasOpenRequestToJoin', '==', true)], { goalId: stakeholder.goalId }).pipe(
          joinWith({
            profile: stakeholder => this.profileService.docData(stakeholder.uid)
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
        return this.stakeholderService.collectionData(query).pipe(
          map(stakeholders => stakeholders.filter(stakeholder => stakeholder.goalId !== goal.id)),
          tap(stakeholders => this.collectiveStakeholder = stakeholders.find(stakeholder => stakeholder.uid === this.auth.uid())),
          joinWith({
            profile: stakeholder => this.profileService.docData(stakeholder.uid),
            goal: stakeholder => this.goalService.docData(stakeholder.goalId)
          }, { shouldAwait: true })
        )
      })
    )

    this.story$ = combineLatest([goalId$, this.storyOrder$]).pipe(
      switchMap(([goalId, order]) => goalId ? this.storyService.collectionData([orderBy('date', order)], { goalId }) : of([])),
      joinWith({
        user: ({ userId }) => userId ? this.profileService.docData(userId) : of(undefined),
        milestone: ({ milestoneId, goalId }) => milestoneId ? this.milestoneService.docData(milestoneId, { goalId }) : of(undefined),
        post: ({ postId, goalId }) => postId
          ? this.postService.docData(postId, { goalId }).pipe(
            map(post => post ? post : createPost()), // fixes bug in ngfire where post is undefined and then crashes on the medias join
            joinWith({
              medias: post => post?.mediaIds ? this.mediaService.collectionData(post.mediaIds, { goalId }) : of([])
            })
          )
          : of(undefined)
      }),
      shareReplay({ bufferSize: 1, refCount: true })
    )

    const supports$ = combineLatest([
      this.auth.profile$,
      goalId$
    ]).pipe(
      switchMap(([profile, goalId]) => {
        if (!profile) return of([[], []])
        return combineLatest([
          this.support.collectionData([where('supporterId', '==', profile.uid)], { goalId }),
          this.support.collectionData([where('recipientId', '==', profile.uid)], { goalId })
        ])
      }),
      map(([supporter, recipient]) => [...supporter, ...recipient]),
      map(supports => supports.filter((support, index) => supports.findIndex(s => s.id === support.id) === index)), // remove duplicates (when user is both supporter and recipient)
      joinWith({
        goal: () => this.goal,
        milestone: ({ milestoneId, goalId }) => milestoneId ? this.milestoneService.docData(milestoneId, { goalId }) : of(undefined),
        recipient: ({ recipientId }) => this.profileService.docData(recipientId),
        supporter: ({ supporterId }) => this.profileService.docData(supporterId)
      }, { shouldAwait: true }),
      shareReplay({ bufferSize: 1, refCount: true })
    )

    this.supports$ = supports$.pipe(map(groupByObjective), map(sortGroupedSupports))

    this.milestones$ = combineLatest([goalId$, this.roadmapOrder$]).pipe(
      switchMap(([goalId, order]) => goalId ? this.milestoneService.collectionData([where('deletedAt', '==', null), orderBy('order', order)], { goalId }) : of([])),
      joinWith({
        achiever: ({ achieverId }) => achieverId ? this.profileService.docData(achieverId) : undefined,
        supports: milestone => supports$.pipe(
          map(supports => supports.filter(support => support.milestoneId === milestone.id))
        ),
        story: milestone => this.story$.pipe(
          map(story => story.filter(item => item.post && item.milestoneId === milestone.id))
        )
      }, { shouldAwait: false })
    )

    this.missedMessages$ = this.stakeholder$.pipe(
      switchMap(stakeholder => stakeholder.uid ? this.commentService.collectionData([where('createdAt', '>', stakeholder.lastCheckedChat)], { goalId: stakeholder.goalId }) : of([])),
      map(comments => comments.length)
    )

    this.accessSubscription = combineLatest([
      this.goal$,
      this.stakeholder$
    ]).pipe(
      map(async ([goal, stakeholder]) => {
        if (!goal) return { access: false, goal }
        if (goal.publicity === 'public') return { access: true, goal }
        const { isAdmin, isAchiever, isSupporter, isSpectator, hasInviteToJoin } = stakeholder
        if (isAdmin || isAchiever || isSupporter || isSpectator || hasInviteToJoin) return { access: true, goal }
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
    addIcons({ arrowBack, checkmarkOutline, notificationsOutline, chatbubblesOutline, personAddOutline, shareSocialOutline, ellipsisHorizontalOutline, flag, notifications, link, lockOpenOutline, lockClosedOutline, timerOutline, closeOutline, arrowDownOutline, arrowUpOutline, sparklesOutline });

    this.stravaIntegrations$ = goalId$.pipe(
      switchMap(goalId => {
        if (!goalId) return of([])

        return this.stravaService.collectionData([where('goalId', '==', goalId)]).pipe(
          map(s => s.sort((a, b) => b.totalActivities - a.totalActivities))
        )
      }),
      joinWith({
        profile: ({ userId }) => this.profileService.docData(userId)
      })
    ) as Observable<(StravaIntegration & { profile: User })[]>
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
        case enumGoalOptions.editNotificationSettings:
          console.warn('not supported yet')
          break
        case enumGoalOptions.editGoal:
          this.editGoal(goal)
          break
        case enumGoalOptions.deleteGoal:
          this.deleteGoal()
          break
        case enumGoalOptions.integrations:
          this.openIntegrations()
          break
        case enumGoalOptions.editReminders:
          this.editReminders()
          break
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
    this.goalService.update(this.goal.id, { publicity })
  }

  private editGoal(goal: Goal) {
    this.modalCtrl.create({
      component: GoalUpdateModalComponent,
      componentProps: { goal }
    }).then(modal => modal.present())
  }

  private deleteGoal() {
    this.alertCtrl.create({
      mode: 'md',
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
      ],
    }).then(alert => alert.present())
  }

  async spectate() {
    if (!this.goal?.id) return
    const uid = this.auth.uid()

    if (!uid) {
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
      uid,
      goalId,
      isSpectator: !isSpectator
    }, { goalId })
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
      component: CollectiveGoalsModalComponent,
      componentProps: {
        goal: this.goal,
        stakeholders
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
      component: DeadlinePopoverComponent,
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
    }, { goalId: this.goal.id })
  }

  navTo(uid: string) {
    this.router.navigate(['/profile/', uid])
  }

  async openZoom(goal: Goal) {
    const split = goal.image.split('/')
    const fileName = split.pop()
    const storagePath = split.join('/')
    const media = createMedia({
      storagePath,
      fileName,
      id: fileName,
      fileType: 'image',
      status: 'uploaded',
      description: goal.description
    })

    const story = await firstValueFrom(this.story$)
    const posts = story
      .map(item => item.post)
      .filter(item => !!item)
      .filter(item => !item?.youtubeId) // removing youtube for ease
    const postMedias = posts.map(post => {
      if (!post || !post.medias) return []
      return post.medias?.map(media => createMedia({
        ...media,
        description: post.description
      }))
    }).flat()

    this.modalCtrl.create({
      component: ImageZoomModalComponent,
      componentProps: {
        medias: [media, ...postMedias],
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
    const state = this.location.getState() as { navigationId: number }

    if (state?.navigationId === 1) {
      this.router.navigateByUrl('/')
    } else {
      this.location.back()
    }
  }

  toggleRoadmapOrder() {
    const order: OrderByDirection = this.roadmapOrder$.value === 'desc' ? 'asc' : 'desc'
    this.roadmapOrder$.next(order)
  }

  toggleStoryOrder() {
    const order: OrderByDirection = this.storyOrder$.value === 'desc' ? 'asc' : 'desc'
    this.storyOrder$.next(order)
  }

  openSuggestion() {
    this.modalCtrl.create({
      component: SuggestionModalComponent,
      componentProps: { goal: this.goal }
    }).then(modal => modal.present())
  }

  async openIntegrations() {
    const modal = await this.modalCtrl.create({
      component: IntegrationsComponent,
      componentProps: { goalId: this.goal?.id }
    })
    modal.present()
    modal.onDidDismiss().then(({ data }) => {
      if (data === 'strava') {
        this.integrateStrava()
      }
    })
  }

  async integrateStrava(stravaAuthParams?: StravaAuthParams) {
    if (!this.goal?.id) {
      await firstValueFrom(this.goal$)
      if (!this.goal?.id) return
    }

    const stravaIntegrations = this.stravaIntegrations$ ? await firstValueFrom(this.stravaIntegrations$) : []
    const integration = stravaIntegrations.find(i => i.userId === this.auth.uid())

    if (integration) {
      // already has integration
      const popover = await this.popoverCtrl.create({
        component: StravaActivityTypesComponent,
        componentProps: { integration }
      })
      popover.onDidDismiss().then(async ({ data }) => {
        if (!data) return
        if (data === 'disable') {
          this.stravaService.update(integration.id, { enabled: false })
          return
        }

        const { types } = data
        this.stravaService.update(integration.id, { activityTypes: types, enabled: true })
      })
      popover.present()

    } else {
      // initialise integration
      let authorizationCode = ''
      let refreshToken = ''
      if (stravaAuthParams) {
        authorizationCode = stravaAuthParams.code
        this.router.navigate([], {
          queryParams: {
            code: null,
            state: null,
            scope: null
          },
          queryParamsHandling: 'merge'
        })
      } else {
        const uid = this.auth.uid()
        if (!uid) return
        const personal = await this.personalService.getDoc(uid)
        console.log('personal: ', personal)
        if (personal?.stravaRefreshToken) {
          refreshToken = personal.stravaRefreshToken
        } else {
          const client_id = 102223
          const redirect_uri = `https://strivejournal.com/goal/${this.goal.id}`
          const response_type = 'code'
          const approval_prompt = 'auto'
          const scope = 'activity:read'
          const url = `https://www.strava.com/oauth/authorize?client_id=${client_id}&redirect_uri=${redirect_uri}&response_type=${response_type}&approval_prompt=${approval_prompt}&scope=${scope}`

          Browser.open({ url })
          return
        }
      }

      const popover = await this.popoverCtrl.create({
        component: StravaActivityTypesComponent
      })
      popover.onDidDismiss().then(async ({ data }) => {
        if (!data) return
        if (!authorizationCode && !refreshToken) return

        const { types, after } = data

        const goalId = this.goal?.id

        const func = httpsCallable(getFunctions(), 'initialiseStrava')
        const stravaInitialised = await func({ goalId, authorizationCode, refreshToken, activityTypes: types, after })
        const { error, result } = stravaInitialised.data as { error: string, result: any }
        if (error) {
          console.error(result)
          captureException(result)
        }
      })
      popover.present()
    }
  }

  async editReminders() {
    if (!this.goal) return

    this.modalCtrl.create({
      component: RemindersModalComponent,
      componentProps: { goalId: this.goal.id, stakeholderId: this.stakeholder.uid }
    }).then(modal => modal.present())
  }
}
