import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';

// Rxjs
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

// Strive Service
import { GoalStakeholderService } from '@strive/goal/stakeholder/+state/stakeholder.service';
import { UserService } from '@strive/user/user/+state/user.service';
import { MilestoneService } from '@strive/milestone/+state/milestone.service';

// Strive Other
import { Milestone } from '@strive/milestone/+state/milestone.firestore';
import { createGoalStakeholder, GoalStakeholder } from '@strive/goal/stakeholder/+state/stakeholder.firestore';
import { Goal } from '@strive/goal/goal/+state/goal.firestore';
import { AlertController, ModalController } from '@ionic/angular';
import { UpsertPostModal } from '@strive/post/components/upsert-modal/upsert-modal.component';

@Component({
  selector: '[goal] journal-goal-roadmap',
  templateUrl: 'roadmap.component.html',
  styleUrls: ['./roadmap.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RoadmapComponent implements OnInit {

  stakeholder$: Observable<GoalStakeholder>

  milestones$: Observable<Milestone[]>

  @Input() goal: Goal

  constructor(
    private alertCtrl: AlertController,
    private cdr: ChangeDetectorRef,
    private milestone: MilestoneService,
    private modalCtrl: ModalController,
    private stakeholderService: GoalStakeholderService,
    private user: UserService
  ) { }

  ngOnInit() {
    this.stakeholder$ = this.user.user$.pipe(
      switchMap(user => user ? this.stakeholderService.valueChanges(user.uid, { goalId: this.goal.id }) : of(undefined)),
      map(stakeholder => createGoalStakeholder(stakeholder))
    )

    this.milestones$ = this.milestone.valueChanges({ goalId: this.goal.id })
  }

  updateStatus(milestone: Milestone, stakeholder: GoalStakeholder) {
    if (milestone.status !== 'pending' && milestone.status !== 'overdue') return
    if (!stakeholder.isAdmin && !stakeholder.isAchiever) return

    this.alertCtrl.create({
      header: 'Good job!',
      subHeader: 'Or didn\'t you?',
      buttons: [
        {
          text: 'Succeeded',
          role: 'succeeded',
          handler: () => {
            this.milestone.upsert({ status: 'succeeded', id: milestone.id }, { params: { goalId: this.goal.id }})
            milestone.status = 'succeeded'
            this.cdr.markForCheck()
            this.startPostCreation(milestone)
          }
        },
        {
          text: 'Failed',
          role: 'succeeded',
          handler: () => {
            this.milestone.upsert({ status: 'failed', id: milestone.id }, { params: { goalId: this.goal.id }})
            milestone.status = 'failed'
            this.cdr.markForCheck()
            this.startPostCreation(milestone)
          }
        },
        {
          text: 'Cancel',
          role: 'cancel',
        },
      ]
    }).then(alert => alert.present())
  }

  private startPostCreation(milestone: Milestone) {
    this.modalCtrl.create({
      component: UpsertPostModal,
      componentProps: {
        milestone,
        goal: this.goal,
        postId: milestone.id
      }
    }).then(modal => modal.present())
  }

}