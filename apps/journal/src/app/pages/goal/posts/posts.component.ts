import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Goal } from '@strive/goal/goal/+state/goal.firestore';
import { GoalStakeholderService } from '@strive/goal/stakeholder/+state/stakeholder.service';
import { UpsertPostModal } from '@strive/post/components/upsert-modal/upsert-modal.component';
import { UserService } from '@strive/user/user/+state/user.service';
import { Subscription } from 'rxjs';
import { GoalFeedPaginationService } from '@strive/notification/+state/goal-feed-pagination.service';

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
    private modalCtrl: ModalController,
    private user: UserService,
    private stakeholder: GoalStakeholderService,
    public feed: GoalFeedPaginationService,
  ) { }

  ngOnInit() {
    // Posts
    this.feed.reset()
    this.feed.init(`Goals/${this.goal.id}/Notifications`)

    this.sub = this.stakeholder.valueChanges(this.user.uid, { goalId: this.goal.id }).subscribe(stakeholder => {
      this.isAdmin = stakeholder.isAdmin ?? false
    })
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  //Posts section
  public loadData(event) {
    this.feed.more()
    event.target.complete();

    if (this.feed.done) {
      event.target.disabled = true
    }
  }

  public refreshPosts($event) {
    this.feed.refresh(`Goals/${this.goal.id}/Notifications`)
    this.feed.refreshing.subscribe(refreshing => {
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
      componentProps: {
        goal: this.goal,
        postId: undefined
      }
    })
    await modal.present()
    await modal.onDidDismiss().then(async (data) => {
      this.feed.refresh(`Goals/${this.goal.id}/Notifications`)
    })
  }
}