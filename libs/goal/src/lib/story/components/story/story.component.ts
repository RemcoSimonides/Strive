import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import { ModalController } from "@ionic/angular";
import { createPost, StoryItem } from "@strive/model";
import { UpsertPostModalComponent } from "@strive/post/components/upsert-modal/upsert-modal.component";

@Component({
	selector: '[story][goalId] goal-story',
	templateUrl: './story.component.html',
	styleUrls: ['./story.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class StoryComponent {

	@Input() story: StoryItem[] = []
	@Input() isAdmin: boolean = false
	@Input() goalId?: string

	constructor(private modalCtrl: ModalController) {}

	createCustomPost() {
		if (!this.goalId) return
		this.modalCtrl.create({
		  component: UpsertPostModalComponent,
		  componentProps: {
			post: createPost({
				goalId: this.goalId
			})
		  }
		}).then(modal => modal.present())
	}

	trackByFn(_: number, item: StoryItem) {
		return item?.id
  }
}