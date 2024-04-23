import { RouterModule } from '@angular/router'
import { ChangeDetectionStrategy, Component, Input } from '@angular/core'

import { ModalController, IonButton, IonIcon } from '@ionic/angular/standalone'
import { addIcons } from 'ionicons'
import { pencilOutline, flagOutline, checkmarkOutline, personAddOutline, bookmarkOutline, alertOutline } from 'ionicons/icons'

import { GoalService } from '@strive/goal/goal.service'
import { createGoalStakeholder, createPost, StoryItem } from '@strive/model'
import { UpsertPostModalComponent } from '@strive/post/modals/upsert/post-upsert.component'
import { StoryItemMessagePipe } from '@strive/story/pipes/story-message'
import { TimeAgoPipe } from '@strive/utils/pipes/time-ago.pipe'
import { PostComponent } from '@strive/post/components/post/post.component'

@Component({
  standalone: true,
  selector: '[story][goalId] strive-story',
  templateUrl: './story.component.html',
  styleUrls: ['./story.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterModule,
    StoryItemMessagePipe,
    TimeAgoPipe,
    PostComponent,
    UpsertPostModalComponent,
    IonButton,
    IonIcon
  ]
})
export class StoryComponent {

  @Input() story: StoryItem[] = []
  @Input() stakeholder = createGoalStakeholder()
  @Input() goalId!: string
  @Input() milestoneId?: string

  constructor(
    private modalCtrl: ModalController,
    private goalService: GoalService
  ) {
    addIcons({ pencilOutline, flagOutline, checkmarkOutline, personAddOutline, bookmarkOutline, alertOutline })
  }

  createCustomPost() {
    if (!this.goalId) return

    const post = createPost({
      id: this.goalService.createId(),
      goalId: this.goalId
    })
    if (this.milestoneId) post.milestoneId = this.milestoneId

    this.modalCtrl.create({
      component: UpsertPostModalComponent,
      componentProps: { post }
    }).then(modal => modal.present())
  }

  trackByFn(_: number, item: StoryItem) {
    return item?.id
  }
}
