import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';
import { Goal } from '@strive/goal/goal/+state/goal.firestore';

import { createMilestone, Milestone, MilestoneStatus } from '@strive/milestone/+state/milestone.firestore';
import { MilestoneService  } from '@strive/milestone/+state/milestone.service';
import { UpsertPostModal } from '@strive/post/components/upsert-modal/upsert-modal.component';

@Component({
  selector: 'strive-milestone-status',
  templateUrl: 'status.component.html',
  styleUrls: ['./status.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MilestoneStatusComponent {

  icon: Record<MilestoneStatus, { 
    name: string,
    color: 'primary' | 'secondary' | 'warning' | 'danger' | 'none',
    pointer: boolean
  }> = {
    pending: {
      name: 'radio-button-off',
      color: 'primary',
      pointer: true
    },
    succeeded: {
      name: 'checkmark-circle',
      color: 'secondary',
      pointer: false
    },
    failed: {
      name: 'close-circle',
      color: 'danger',
      pointer: false
    },
    neutral: {
      name: 'remove-circle',
      color: 'warning',
      pointer: false
    },
    overdue: {
      name: 'radio-button-off',
      color: 'primary',
      pointer: true
    }
  }

  @Input() milestone: Milestone = createMilestone()
  @Input() goal: Goal
  @Input() isAdmin: boolean
  @Input() isAchiever: boolean

  constructor(
    private alertCtrl: AlertController,
    private cdr: ChangeDetectorRef,
    private milestoneService: MilestoneService,
    private modalCtrl: ModalController
  ) {}

  updateStatus(event: UIEvent) {
    event.stopPropagation()
    if (!this.goal?.id) return
    if (this.milestone.status !== 'pending' && this.milestone.status !== 'overdue') return
    if (!this.isAdmin && this.isAchiever) return
    
    this.alertCtrl.create({
      header: 'Good job!',
      subHeader: 'Or didn\'t you?',
      buttons: [
        {
          text: 'Succeeded',
          role: 'succeeded',
          handler: () => {
            this.milestoneService.upsert({ status: 'succeeded', id: this.milestone.id }, { params: { goalId: this.goal.id }})
            this.milestone.status = 'succeeded'
            this.cdr.markForCheck()
            this.startPostCreation(this.milestone)
          }
        },
        {
          text: 'Failed',
          role: 'succeeded',
          handler: () => {
            this.milestoneService.upsert({ status: 'failed', id: this.milestone.id }, { params: { goalId: this.goal.id }})
            this.milestone.status = 'failed'
            this.cdr.markForCheck()
            this.startPostCreation(this.milestone)
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