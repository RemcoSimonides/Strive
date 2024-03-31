import { Component, Input, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core'
import { ModalController, PopoverController } from '@ionic/angular'

import { createGoalStakeholder, Post, StoryItem, User } from '@strive/model'

import { PostOptionsComponent } from '@strive/post/popovers/options/options.component'
import { getEnterAnimation, getLeaveAnimation, ImageZoomModalComponent } from '@strive/ui/image-zoom/image-zoom.component'

@Component({
  selector: '[storyItem] strive-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.ShadowDom
})
export class PostComponent {

  @Input() set storyItem(storyItem: StoryItem) {
    if (!storyItem) return
    const { user, post } = storyItem

    this.author = user
    this.post = post
  }
  @Input() stakeholder = createGoalStakeholder()

  author?: User
  post?: Post

  constructor(
    private modalCtrl: ModalController,
    private popoverCtrl: PopoverController
  ) {}

  openZoom(index: number) {
    const medias = this.post?.medias
    if (!medias?.length) return

    this.modalCtrl.create({
      component: ImageZoomModalComponent,
      componentProps: { medias, index },
      enterAnimation: getEnterAnimation,
      leaveAnimation: getLeaveAnimation
    }).then(modal => modal.present())
  }

  openPostOptions(event: UIEvent) {
    if (!this.post) return
    this.popoverCtrl.create({
      component: PostOptionsComponent,
      componentProps: {
        post: this.post,
        stakeholder: this.stakeholder
      },
      event
    }).then(popover => popover.present())
  }
}
