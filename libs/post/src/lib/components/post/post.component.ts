import { Component, OnInit, Input, ChangeDetectionStrategy } from '@angular/core';
import { ModalController, PopoverController } from '@ionic/angular';
import { Post, StoryItem, UserLink } from '@strive/model'
import { PostOptionsComponent } from '@strive/post/popovers/options/options.component';
import { PostService } from '@strive/post/post.service';
import { ImageZoomModalComponent, getEnterAnimation, getLeaveAnimation } from '@strive/ui/image-zoom/image-zoom.component';
import { Observable } from 'rxjs';

@Component({
  selector: '[storyItem] post-main',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PostComponent implements OnInit {

  @Input() storyItem!: StoryItem
  @Input() isAdmin = false
  author?: UserLink

  post$?: Observable<Post | undefined>
  
  constructor(
    private modalCtrl: ModalController,
    private popoverCtrl: PopoverController,
    private post: PostService
  ) {}

  ngOnInit() {
    const { postId, user, goal } = this.storyItem.source
    this.author = user
    this.post$ = this.post.valueChanges(postId, { goalId: goal.id })
  }

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
