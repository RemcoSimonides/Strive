import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router'
import { Component, Input, ChangeDetectionStrategy, ViewEncapsulation, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'
import { ModalController, PopoverController } from '@ionic/angular/standalone'

import { IonCard, IonAvatar, IonButton, IonIcon, IonCardContent } from '@ionic/angular/standalone'
import { addIcons } from 'ionicons'
import { ellipsisVerticalOutline } from 'ionicons/icons'

import { createGoalStakeholder, Post, StoryItem, User } from '@strive/model'

import { PostOptionsComponent } from '@strive/post/popovers/options/options.component'
import { getEnterAnimation, getLeaveAnimation, ImageZoomModalComponent } from '@strive/ui/image-zoom/image-zoom.component'
import { ImageDirective } from '@strive/media/directives/image.directive'
import { HTMLPipe } from '@strive/utils/pipes/string-to-html.pipe'
import { SafePipe } from '@strive/utils/pipes/safe-url.pipe'
import { MediaRefPipe } from '@strive/media/pipes/media.pipe'

@Component({
  standalone: true,
  selector: '[storyItem] strive-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.ShadowDom,
  imports: [
    CommonModule,
    RouterModule,
    ImageDirective,
    ImageZoomModalComponent,
    PostOptionsComponent,
    HTMLPipe,
    SafePipe,
    MediaRefPipe,
    IonCard,
    IonAvatar,
    IonButton,
    IonIcon,
    IonCardContent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
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
  ) {
    addIcons({ ellipsisVerticalOutline })
  }

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
