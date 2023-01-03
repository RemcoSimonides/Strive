import { ChangeDetectionStrategy, Component } from '@angular/core'
import { ActivatedRoute } from '@angular/router'

import { joinWith } from 'ngfire'
import { orderBy } from 'firebase/firestore'
import { map, Observable, of, shareReplay, switchMap } from 'rxjs'

import { StoryService } from '@strive/story/story.service'
import { ProfileService } from '@strive/user/user/profile.service'
import { MilestoneService } from '@strive/roadmap/milestone.service'
import { PostService } from '@strive/post/post.service'
import { createGoalStakeholder, StoryItem } from '@strive/model'

@Component({
  selector: '[id] strive-story',
  templateUrl: './story.component.html',
  styleUrls: ['./story.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StoryComponent {

  goalId$ = this.route.params.pipe(
    map(params => params['id'] as string),
    shareReplay({ bufferSize: 1, refCount: true })
  )

  story$: Observable<StoryItem[]> = this.goalId$.pipe(
    switchMap(goalId => goalId ? this.storyService.valueChanges([orderBy('date', 'desc')], { goalId }) : of([])),
    joinWith({
      user: ({ userId }) => userId ? this.profileService.valueChanges(userId) : of(undefined),
      milestone: ({ milestoneId, goalId }) => milestoneId ? this.milestoneService.valueChanges(milestoneId, { goalId }) : of(undefined),
      post: ({ postId, goalId }) => postId ? this.postService.valueChanges(postId, { goalId }) : of(undefined)
    })
  )

  stakeholder = createGoalStakeholder({ isAdmin: true, isAchiever: true, isSupporter: true, isSpectator: true })

  constructor(
    private route: ActivatedRoute,
    private milestoneService: MilestoneService,
    private postService: PostService,
    private profileService: ProfileService,
    private storyService: StoryService
  ) {}
}
