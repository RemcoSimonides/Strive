import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'
import { Component, Input, ChangeDetectionStrategy, ViewEncapsulation, CUSTOM_ELEMENTS_SCHEMA, AfterViewInit, Inject, Renderer2, DOCUMENT } from '@angular/core'
import { ModalController, PopoverController } from '@ionic/angular/standalone'

import { IonCard, IonAvatar, IonButton, IonIcon, IonCardContent } from '@ionic/angular/standalone'
import { addIcons } from 'ionicons'
import { ellipsisVerticalOutline, play } from 'ionicons/icons'

import { createGoalStakeholder, Post, StoryItem, User } from '@strive/model'

import { PostOptionsComponent } from '@strive/post/popovers/options/options.component'
import { getEnterAnimation, getLeaveAnimation, ImageZoomModalComponent } from '@strive/ui/image-zoom/image-zoom.component'
import { ImageDirective } from '@strive/media/directives/image.directive'
import { HTMLPipe } from '@strive/utils/pipes/string-to-html.pipe'
import { SafePipe } from '@strive/utils/pipes/safe-url.pipe'
import { MediaRefPipe, VideoUrlPipe } from '@strive/media/pipes/media.pipe'

@Component({
    selector: '[storyItem] strive-post',
    templateUrl: './post.component.html',
    styleUrls: ['./post.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None, // Strava embed
    imports: [
        CommonModule,
        RouterModule,
        ImageDirective,
        HTMLPipe,
        SafePipe,
        MediaRefPipe,
        VideoUrlPipe,
        IonCard,
        IonAvatar,
        IonButton,
        IonIcon,
        IonCardContent
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class PostComponent implements AfterViewInit {

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
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document,
    private modalCtrl: ModalController,
    private popoverCtrl: PopoverController
  ) {
    addIcons({ ellipsisVerticalOutline, play })
  }

  ngAfterViewInit() {
    if (this.post?.stravaActivityId) {
      const script = this.renderer.createElement('script')
      script.type = 'text/javascript'
      script.src = 'https://strava-embeds.com/embed.js'
      script.async = true
      this.renderer.appendChild(this.document.body, script)
    }
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
