import { Component, Input, ChangeDetectionStrategy } from '@angular/core'
import { ModalController, PopoverController } from '@ionic/angular'

import { createGoalStakeholder, Post, StoryItem, User } from '@strive/model'

import { PostOptionsComponent } from '@strive/post/popovers/options/options.component'
import { ImageZoomModalComponent, getEnterAnimation, getLeaveAnimation } from '@strive/ui/image-zoom/image-zoom.component'

@Component({
  selector: '[storyItem] post-main',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
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

  openZoom(ref: string) {
    this.modalCtrl.create({
      component: ImageZoomModalComponent,
      componentProps: { ref },
      enterAnimation: getEnterAnimation,
      leaveAnimation: getLeaveAnimation
    }).then(modal => modal.present())
  }

  openPostOptions(post: Post, event: UIEvent) {
    this.popoverCtrl.create({
      component: PostOptionsComponent,
      componentProps: { post },
      event
    }).then(popover => popover.present())
  }
}
