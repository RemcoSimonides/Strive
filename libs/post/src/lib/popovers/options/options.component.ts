import { ChangeDetectionStrategy, Component, HostListener, Input } from '@angular/core'

import { AlertController, IonList, IonItem, ModalController, PopoverController } from '@ionic/angular/standalone'

import { Post, createGoalStakeholder } from '@strive/model'
import { PostService } from '@strive/post/post.service'

import { UpsertPostModalComponent } from '../../modals/upsert/post-upsert.component'

@Component({
	standalone: true,
	selector: '[post] strive-post-options',
	templateUrl: './options.component.html',
	styleUrls: ['./options.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [
    UpsertPostModalComponent,
    IonList,
    IonItem
	]
})
export class PostOptionsComponent {
	@HostListener('window:popstate', ['$event'])
	onPopState() { this.popoverCtrl.dismiss() }

	@Input() post!: Post
	@Input() stakeholder = createGoalStakeholder()

	constructor(
		private alertCtrl: AlertController,
		private modalCtrl: ModalController,
		private popoverCtrl: PopoverController,
		private postService: PostService
	) { }

	edit() {
		this.popoverCtrl.dismiss()
		this.modalCtrl.create({
			component: UpsertPostModalComponent,
			componentProps: { post: this.post }
		}).then(modal => modal.present())
	}

	remove() {
		this.alertCtrl.create({
			subHeader: `Are you sure you want to remove this post?`,
			message: `This action is irreversable`,
			buttons: [
				{
					text: 'Yes',
					handler: async () => {
						if (!this.post.id) throw new Error('Post id has to be available when removing post')
						this.postService.remove(this.post.id, { params: { goalId: this.post.goalId } })
					}
				},
				{
					text: 'No',
					role: 'cancel'
				}
			]
		}).then(alert => alert.present())
		this.popoverCtrl.dismiss()
	}
}
