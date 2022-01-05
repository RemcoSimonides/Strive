import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { Goal } from '@strive/goal/goal/+state/goal.firestore';
import { GoalStakeholderService } from '@strive/goal/stakeholder/+state/stakeholder.service';
import { UserService } from '@strive/user/user/+state/user.service';
import { Observable, of } from 'rxjs';
import { GoalFeedPaginationService } from '@strive/notification/+state/goal-feed-pagination.service';
import { map, switchMap } from 'rxjs/operators';
import { createGoalStakeholder } from '@strive/goal/stakeholder/+state/stakeholder.firestore';

@Component({
  selector: '[goal] journal-goal-posts',
  templateUrl: 'posts.component.html',
  styleUrls: ['./posts.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PostsComponent implements OnInit {
  @Input() goal: Goal

  isAdmin$: Observable<boolean>

  constructor(
    private user: UserService,
    private stakeholder: GoalStakeholderService,
    public feed: GoalFeedPaginationService,
  ) { }

  ngOnInit() {
    // Posts
    this.feed.reset()
    this.feed.init(`Goals/${this.goal.id}/Notifications`)
    this.feed.listenToUpdates()

    this.isAdmin$ = this.user.user$.pipe(
      switchMap(user => user ? this.stakeholder.valueChanges(user.uid, { goalId: this.goal.id }) : of(undefined)),
      map(stakeholder => createGoalStakeholder(stakeholder).isAdmin)
    )
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
    this.feed.refreshing$.subscribe(refreshing => {
      if (refreshing === false) {
        setTimeout(() => {
          $event.target.complete();
        }, 500);
      }
    })
    
    setTimeout(() => {
      $event.target.complete();
    }, 5000);
  }
}