import { ChangeDetectionStrategy, Component, Input } from '@angular/core'
import { AlertController, ModalController, PopoverController } from '@ionic/angular'
import { Post } from '@strive/model'
import { PostService } from '@strive/post/post.service'

import { UpsertPostModalComponent } from '../../modals/upsert/post-upsert.component'

@Component({
	selector: '[post] strive-post-options',
	templateUrl: './options.component.html',
	styleUrls: ['./options.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class PostOptionsComponent {

	@Input() post!: Post

	constructor(
		private alertCtrl: AlertController,
		private modalCtrl: ModalController,
		private popoverCtrl: PopoverController,
		private postService: PostService
	) {}

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
						this.postService.remove(this.post.id, { params: { goalId: this.post.goalId }})
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