import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { ModalController } from '@ionic/angular'

import { orderBy, where } from 'firebase/firestore'
import { joinWith } from 'ngfire'
import { Subscription, of, Observable, combineLatest } from 'rxjs'
import { distinctUntilChanged, map, shareReplay, switchMap, tap } from 'rxjs/operators'

import { GoalService } from '@strive/goal/goal/goal.service'
import { GoalStakeholderService } from '@strive/goal/stakeholder/stakeholder.service'
import { InviteTokenService } from '@strive/utils/services/invite-token.service'
import { SeoService } from '@strive/utils/services/seo.service'
import { ProfileService } from '@strive/user/user/profile.service'
import { CommentService } from '@strive/goal/chat/comment.service'
import { StoryService } from '@strive/goal/story/story.service'
import { MilestoneService } from '@strive/goal/milestone/milestone.service'
import { PostService } from '@strive/post/post.service'
import { AuthService } from '@strive/user/auth/auth.service'

import { Goal, createGoalStakeholder, GoalStakeholder, StoryItem, createPost } from '@strive/model'
import { UpsertPostModalComponent } from '@strive/post/components/upsert-modal/upsert-modal.component'
import { getImgIxResourceUrl } from '@strive/media/directives/imgix-helpers'

function stakeholderChanged(before: GoalStakeholder | undefined, after: GoalStakeholder | undefined): boolean {
  if (!before || !after) return true

  const fields: (keyof GoalStakeholder)[] = [
    'isAchiever',
    'isAdmin',
    'isSupporter',
    'isSpectator',
    'hasOpenRequestToJoin',
    'username',
    'photoURL',
    'lastCheckedChat'
  ]

  return fields.some(field => before[field] !== after[field])
}

@Component({
  selector: 'journal-goal-view',
  templateUrl: './goal-view.page.html',
  styleUrls: ['./goal-view.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GoalViewComponent implements OnDestroy {
  pageIsLoading = true
  canAccess = false

  segmentChoice: 'goal' | 'story' | 'chat' = 'goal'

  goal$?: Observable<Goal | undefined>
  stakeholder$?: Observable<GoalStakeholder>
  unreadMessages$?: Observable<number>
  story$?: Observable<StoryItem[]>

  isLoggedIn$ = this.auth.isLoggedIn$

  private accessSubscription?: Subscription

  constructor(
    private auth: AuthService,
    private cdr: ChangeDetectorRef,
    private commentService: CommentService,
    private goalService: GoalService,
    private inviteTokenService: InviteTokenService,
    private milestoneService: MilestoneService,
    private modalCtrl: ModalController,
    private postService: PostService,
    private profileService: ProfileService,
    private route: ActivatedRoute,
    private seo: SeoService,
    private stakeholder: GoalStakeholderService,
    private storyService: StoryService
  ) {
    const goalId$ = this.route.params.pipe(
      map(params => params['id'] as string),
      shareReplay({ bufferSize: 1, refCount: true })
    )

    this.goal$ = goalId$.pipe(
      switchMap(goalId => this.goalService.valueChanges(goalId)),
      shareReplay({ bufferSize: 1, refCount: true })
    )

    this.stakeholder$ = combineLatest([
      goalId$,
      this.auth.profile$
    ]).pipe(
      tap(([ goalId, profile ]) => {
        if (profile) this.stakeholder.updateLastCheckedGoal(goalId, profile.uid)
      }),
      switchMap(([ goalId, user ]) => user ? this.stakeholder.valueChanges(user.uid, { goalId }) : of(undefined)),
      distinctUntilChanged((a, b) => !stakeholderChanged(a, b)),
      map(stakeholder => createGoalStakeholder(stakeholder)),
      shareReplay({ bufferSize: 1, refCount: true })
    )

    this.unreadMessages$ = combineLatest([
      goalId$,
      this.stakeholder$
    ]).pipe(    
      switchMap(([ goalId, stakeholder ]) => {
        if (!stakeholder.uid) return of([])
        const query = []
        if (stakeholder.lastCheckedChat) query.push(where('createdAt', '>', stakeholder.lastCheckedChat))
        return this.commentService.valueChanges(query, { goalId }).pipe(
          map(messages => messages.filter(message => message.userId !== stakeholder.uid)),
        )
      }),
      map(messages => messages.length)
    )

    this.story$ = goalId$.pipe(
      switchMap(goalId => goalId ? this.storyService.valueChanges([orderBy('date', 'desc')], { goalId }) : of([])),
      joinWith({
        user: ({ userId }) => userId ? this.profileService.valueChanges(userId) : of(undefined),
        milestone: ({ milestoneId, goalId }) => milestoneId ? this.milestoneService.valueChanges(milestoneId, { goalId }) : of(undefined),
        post: ({ postId, goalId }) => postId ? this.postService.valueChanges(postId, { goalId }) : of(undefined)
      })
    )

    this.accessSubscription = combineLatest([
      this.goal$,
      this.stakeholder$
    ]).pipe(
      map(async ([ goal, stakeholder ]) => {
        if (!goal) return { access: false, goal }
        if (goal.publicity === 'public') return { access: true, goal }
        const { isAdmin, isAchiever, isSupporter, isSpectator } = stakeholder
        if (isAdmin || isAchiever || isSupporter || isSpectator) return { access: true, goal }
        const access = await this.inviteTokenService.checkInviteToken(goal.id)
        return { access, goal }
      })
    ).subscribe(async promise => {
      const { goal, access } = await promise
      access && goal ? this.initGoal(goal) : this.initNoAccess()
    })

    const { t } = this.route.snapshot.queryParams;
    this.segmentChoice = ['goal', 'story', 'chat'].includes(t) ? t : 'goal'
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
      description: goal.description ? goal.description : `Check the plan, follow the progress, chat with the team, and help out wherever you can`,
      image: goal.image ? getImgIxResourceUrl(goal.image) : undefined
    })
  }

  private initNoAccess() {
    this.pageIsLoading = false
    this.canAccess = false
    this.cdr.markForCheck()
  }

  segmentChanged(ev: CustomEvent) {
    this.segmentChoice = ev.detail.value
  }

  createCustomPost(goal: Goal) {
    this.modalCtrl.create({
      component: UpsertPostModalComponent,
      componentProps: {
        post: createPost({ goalId: goal.id })
      }
    }).then(modal => modal.present())
  }
}
