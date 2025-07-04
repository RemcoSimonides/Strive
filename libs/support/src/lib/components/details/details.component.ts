import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core'
import { FormControl, ReactiveFormsModule } from '@angular/forms'
import { RouterModule } from '@angular/router'
import { AlertController, IonList, IonItem, IonInput, IonButton, IonContent } from '@ionic/angular/standalone'

import { joinWith } from 'ngfire'

import { filter, map, Observable, of, shareReplay } from 'rxjs'

import { StoryItem, Support } from '@strive/model'
import { SupportService } from '@strive/support/support.service'
import { PostService } from '@strive/post/post.service'
import { ProfileService } from '@strive/user/profile.service'
import { StoryService } from '@strive/story/story.service'
import { MilestoneService } from '@strive/roadmap/milestone.service'
import { AuthService } from '@strive/auth/auth.service'
import { PledgeComponent } from '../pledge/pledge.component'
import { SupportDecisionComponent } from '../decision/decision.component'
import { PostComponent } from '@strive/post/components/post/post.component'
import { IsRecipientPipe, IsSupporterPipe } from '@strive/support/pipes/role.pipe'

@Component({
    selector: 'strive-support-details',
    templateUrl: './details.component.html',
    styleUrls: ['./details.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        CommonModule,
        PledgeComponent,
        RouterModule,
        ReactiveFormsModule,
        SupportDecisionComponent,
        PostComponent,
        IsRecipientPipe, IsSupporterPipe,
        IonList,
        IonItem,
        IonInput,
        IonButton
    ]
})
export class SupportDetailsComponent implements OnInit {
  private alertCtrl = inject(AlertController);
  private auth = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);
  private milestoneService = inject(MilestoneService);
  private postService = inject(PostService);
  private profileService = inject(ProfileService);
  private storyService = inject(StoryService);
  private supportService = inject(SupportService);


  @Input() support?: Support
  @Input() showGoalLink = false

  @Output() removed = new EventEmitter()

  post$?: Observable<StoryItem | undefined>
  isSupporter$?: Observable<boolean>
  isRecipient$?: Observable<boolean>

  counterForm = new FormControl('', { nonNullable: true })

  ngOnInit() {
    if (!this.support?.id) return

    this.isSupporter$ = this.auth.uid$.pipe(
      map(uid => uid === this.support?.supporterId)
    )

    this.isRecipient$ = this.auth.uid$.pipe(
      map(uid => uid === this.support?.recipientId)
    )

    this.counterForm.setValue(this.support.counterDescription)

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
      this.supportService.update(this.support.id, { status: 'accepted', needsDecision: false }, { params: { goalId: this.support.goalId } })
      this.support.status = 'accepted'
      this.support.needsDecision = false
    }

    const completed = this.support.milestone
      ? this.support.milestone.status === 'failed' || this.support.milestone.status === 'succeeded'
      : this.support.goal?.status !== 'pending'

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
            this.supportService.remove(this.support.id, { params: { goalId: this.support.goalId } })
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

  counter() {
    if (this.counterForm.invalid) return
    if (!this.support) return

    this.supportService.upsert({
      id: this.support.id,
      counterDescription: this.counterForm.value
    }, { params: { goalId: this.support.goalId } })
    this.support.counterDescription = this.counterForm.value
    this.cdr.markForCheck()
  }
}
