import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core'
import { AlertController } from '@ionic/angular'

import { joinWith } from 'ngfire'

import { filter, Observable, of, shareReplay } from 'rxjs'

import { StoryItem, Support, SupportStatus } from '@strive/model'
import { SupportService } from '@strive/support/support.service'
import { PostService } from '@strive/post/post.service'
import { ProfileService } from '@strive/user/user/profile.service'
import { StoryService } from '@strive/goal/story/story.service'
import { MilestoneService } from '@strive/goal/milestone/milestone.service'

@Component({
  selector: 'support-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SupportDetailsComponent implements OnInit {

  @Input() support?: Support

  post$?: Observable<StoryItem | undefined>

  constructor(
    private alertCtrl: AlertController,
    private milestoneService: MilestoneService,
    private postService: PostService,
    private profileService: ProfileService,
    private storyService: StoryService,
    private supportService: SupportService
  ) {}

  ngOnInit() {
    if (!this.support?.id) return

    const id = this.support.milestone ? this.support.milestone.id : this.support.goalId
    this.post$ = this.storyService.valueChanges(id, { goalId: this.support.goalId }).pipe(
      filter(storyItem => !!storyItem),
      joinWith({
        user: (i) => i?.userId ? this.profileService.valueChanges(i.userId) : of(undefined),
        milestone: (i) => i?.milestoneId ? this.milestoneService.valueChanges(i.milestoneId, { goalId: i.goalId }) : of(undefined),
        post: (i) => i?.postId ? this.postService.valueChanges(i.postId, { goalId: i.goalId }) : of(undefined)
      }, { shouldAwait: true }),
      shareReplay({ bufferSize: 1, refCount: true }),
    )
  }

  updateStatus(status: SupportStatus) {
    if (!this.support?.id) return
    this.supportService.update(this.support.id, { status }, { params: { goalId: this.support.goalId }})
  }

  give() {
    if (!this.support?.id) return

    this.alertCtrl.create({
      subHeader: `The ${this.support.milestoneId ? 'milestone' : 'goal'} is not completed yet`,
      message: `Are you sure you want to give this support already?`,
      buttons: [
        {
          text: 'Yes',
          handler: () => this.updateStatus('waiting_to_be_paid')
        },
        {
          text: 'No',
          role: 'cancel'
        }
      ]
    }).then(alert => alert.present())
  }

  remove() {
    this.alertCtrl.create({
      subHeader: `Are you sure you want to remove this support?`,
      message: `This action is irreversible`,
      buttons: [
        {
          text: 'Yes',
          handler: () => {
            if (!this.support?.id) return
            this.supportService.remove(this.support.id, { params: { goalId: this.support.goalId }})
          }
        },
        {
          text: 'No',
          role: 'cancel'
        }
      ]
    }).then(alert => alert.present())
  }

}