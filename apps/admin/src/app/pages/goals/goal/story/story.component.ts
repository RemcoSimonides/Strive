import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, inject } from '@angular/core'
import { ActivatedRoute, RouterModule } from '@angular/router'

import { joinWith } from '@strive/utils/firebase'
import { orderBy } from 'firebase/firestore'
import { map, Observable, of, shareReplay, switchMap } from 'rxjs'

import { StoryService } from '@strive/story/story.service'
import { ProfileService } from '@strive/user/profile.service'
import { MilestoneService } from '@strive/roadmap/milestone.service'
import { PostService } from '@strive/post/post.service'
import { createGoalStakeholder, StoryItem } from '@strive/model'
import { StoryItemMessagePipe } from '@strive/story/pipes/story-message'

@Component({
    selector: '[id] strive-story',
    templateUrl: './story.component.html',
    styleUrls: ['./story.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        CommonModule,
        RouterModule,
        StoryItemMessagePipe,
    ]
})
export class StoryComponent {
  private route = inject(ActivatedRoute);
  private milestoneService = inject(MilestoneService);
  private postService = inject(PostService);
  private profileService = inject(ProfileService);
  private storyService = inject(StoryService);


  goalId$ = this.route.params.pipe(
    map(params => params['id'] as string),
    shareReplay({ bufferSize: 1, refCount: true })
  )

  story$: Observable<StoryItem[]> = this.goalId$.pipe(
    switchMap(goalId => goalId ? this.storyService.collectionData([orderBy('date', 'desc')], { goalId }) : of([])),
    joinWith({
      user: ({ userId }) => userId ? this.profileService.docData(userId) : of(undefined),
      milestone: ({ milestoneId, goalId }) => milestoneId ? this.milestoneService.docData(milestoneId, { goalId }) : of(undefined),
      post: ({ postId, goalId }) => postId ? this.postService.docData(postId, { goalId }) : of(undefined)
    })
  )

  stakeholder = createGoalStakeholder({ isAdmin: true, isAchiever: true, isSupporter: true, isSpectator: true })

}
