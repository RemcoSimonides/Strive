import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Goal } from '@strive/goal/goal/+state/goal.firestore';
import { GoalStakeholderService } from '@strive/goal/stakeholder/+state/stakeholder.service';
import { enumPostSource, Post } from '@strive/post/+state/post.firestore';
import { PostService } from '@strive/post/+state/post.service';
import { UpsertPostModal } from '@strive/post/components/upsert-modal/upsert-modal.component';
import { UserService } from '@strive/user/user/+state/user.service';
import { Subscription } from 'rxjs';
import { ImageService } from '../../../services/image/image.service';
import { NotificationPaginationService } from '../../../services/pagination/notification-pagination.service';

@Component({
  selector: '[goal] journal-goal-posts',
  templateUrl: 'posts.component.html',
  styleUrls: ['./posts.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class PostsComponent implements OnInit, OnDestroy {
  @Input() goal: Goal

  isAdmin = false
  private sub: Subscription

  constructor(
    private postService: PostService,
    private imageService: ImageService,
    private modalCtrl: ModalController,
    private user: UserService,
    private stakeholder: GoalStakeholderService,
    public paginationService: NotificationPaginationService,
  ) { }

  ngOnInit() {
    // Posts
    this.paginationService.reset()
    this.paginationService.init(`Goals/${this.goal.id}/Notifications`, 'createdAt', { reverse: true, prepend: false, limit: 10 })

    this.sub = this.stakeholder.getStakeholder$(this.user.uid, this.goal.id).subscribe(stakeholder => {
      this.isAdmin = stakeholder.isAdmin ?? false
    })
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  //Posts section
  public loadData(event) {
    this.paginationService.more()
    event.target.complete();

    if (this.paginationService.done) {
      event.target.disabled = true
    }
  }

  public refreshPosts($event) {
    this.paginationService.refresh(`Goals/${this.goal.id}/Notifications`, 'createdAt', { reverse: true, prepend: false, limit: 10 })
    this.paginationService.refreshing.subscribe(refreshing => {
      if (refreshing === false) {
        setTimeout(() => {
          $event.target.complete();
        }, 500);
      }
    })
  }

  public async createCustomPost() {
    const modal = await this.modalCtrl.create({
      component: UpsertPostModal,
    })
    await modal.present()
    await modal.onDidDismiss().then(async (data) => {

      if (data.data) {
        const post = <Post>{}

        // Prepare post object
        post.content = {
          title: data.data.title,
          description: data.data.description,
          mediaURL: await this.imageService.uploadImage(`Goals/${this.goal.id}/Posts/${this.goal.id}`, false)
        }
        post.goal = {
          id: this.goal.id,
          title: this.goal.title,
          image: this.goal.image,
        }
        post.isEvidence = false

        // Create post
        await this.postService.createPost(enumPostSource.custom, post)

      }
      await this.imageService.reset()

      this.paginationService.refresh(`Goals/${this.goal.id}/Notifications`, 'createdAt', { reverse: true, prepend: false, limit: 10 })
    })
  }
}