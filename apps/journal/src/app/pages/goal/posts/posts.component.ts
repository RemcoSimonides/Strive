import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Goal } from '@strive/goal/goal/+state/goal.firestore';
import { GoalStakeholderService } from '@strive/goal/stakeholder/+state/stakeholder.service';
import { UpsertPostModal } from '@strive/post/components/upsert-modal/upsert-modal.component';
import { UserService } from '@strive/user/user/+state/user.service';
import { Subscription } from 'rxjs';
import { NotificationPaginationService } from '@strive/notification/+state/notification-pagination.service';

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
    public paginationService: NotificationPaginationService,
  ) { }

  ngOnInit() {
    // Posts
    this.paginationService.reset()
    this.paginationService.init(`Goals/${this.goal.id}/Notifications`, 'createdAt', 10 )

    this.sub = this.stakeholder.valueChanges(this.user.uid, { goalId: this.goal.id }).subscribe(stakeholder => {
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
    this.paginationService.refresh(`Goals/${this.goal.id}/Notifications`, 'createdAt', 10 )
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
      componentProps: {
        goal: this.goal,
        postId: undefined
      }
    })
    await modal.present()
    await modal.onDidDismiss().then(async (data) => {
      console.log('dismissed: ', data)
      this.paginationService.refresh(`Goals/${this.goal.id}/Notifications`, 'createdAt', 10 )
    })
  }
}