import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core'
import { AlertController } from '@ionic/angular'

import { joinWith } from 'ngfire'

import { filter, map, Observable, of, shareReplay } from 'rxjs'

import { StoryItem, Support } from '@strive/model'
import { SupportService } from '@strive/support/support.service'
import { PostService } from '@strive/post/post.service'
import { ProfileService } from '@strive/user/user/profile.service'
import { StoryService } from '@strive/goal/story/story.service'
import { MilestoneService } from '@strive/goal/milestone/milestone.service'
import { AuthService } from '@strive/user/auth/auth.service'

@Component({
  selector: 'support-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SupportDetailsComponent implements OnInit {

  @Input() support?: Support

  @Output() removed = new EventEmitter()

  post$?: Observable<StoryItem | undefined>
  isSupporter$?: Observable<boolean>
  isRecipient$?: Observable<boolean>

  constructor(
    private alertCtrl: AlertController,
    private auth: AuthService,
    private milestoneService: MilestoneService,
    private postService: PostService,
    private profileService: ProfileService,
    private storyService: StoryService,
    private supportService: SupportService
  ) {}

  ngOnInit() {
    if (!this.support?.id) return

    this.isSupporter$ = this.auth.uid$.pipe(
      map(uid => uid === this.support?.supporterId)
    )

    this.isRecipient$ = this.auth.uid$.pipe(
      map(uid => uid === this.support?.recipientId)
    )

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

  give() {
    if (!this.support?.id) return

    const give = () => {
      if (!this.support?.id) return
      this.supportService.update(this.support.id, { status: 'waiting_to_be_paid', needsDecision: false }, { params: { goalId: this.support.goalId }})
      this.support.status = 'waiting_to_be_paid'
      this.support.needsDecision = false
    }

    const completed = this.support.milestone
      ? this.support.milestone.status === 'failed' || this.support.milestone.status === 'succeeded'
      : this.support.goal?.isFinished

    if (completed) return give()

    this.alertCtrl.create({
      subHeader: `The ${this.support.milestoneId ? 'milestone' : 'goal'} is not completed yet`,
      message: `Are you sure you want to give this support already?`,
      buttons: [
        {
          text: 'Yes',
          handler: () => give()
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
            this.removed.emit()
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