import { ChangeDetectionStrategy, Component, Input } from '@angular/core'
import { ModalController } from '@ionic/angular'
import { GoalService } from '@strive/goal/goal/goal.service'
import { createGoalStakeholder, createPost, StoryItem } from '@strive/model'
import { UpsertPostModalComponent } from '@strive/post/components/upsert-modal/upsert-modal.component'

@Component({
	selector: '[story][goalId] strive-story',
	templateUrl: './story.component.html',
	styleUrls: ['./story.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class StoryComponent {

	@Input() story: StoryItem[] = []
	@Input() stakeholder = createGoalStakeholder()
	@Input() goalId!: string
	@Input() milestoneId?: string

	constructor(
		private modalCtrl: ModalController,
		private goalService: GoalService
	) {}

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