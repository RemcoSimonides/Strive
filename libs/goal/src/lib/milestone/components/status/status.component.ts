import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';
import { createGoalStakeholder, createMilestone, createPost, Goal } from '@strive/model'

import { Milestone, MilestoneStatus } from '@strive/model'
import { MilestoneService  } from '@strive/goal/milestone/milestone.service';
import { UpsertPostModalComponent } from '@strive/post/components/upsert-modal/upsert-modal.component';
import { serverTimestamp } from 'firebase/firestore';

@Component({
  selector: 'goal-milestone-status',
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
    overdue: {
      name: 'radio-button-off',
      color: 'primary',
      pointer: true
    }
  }

  @Input() milestone = createMilestone()
  @Input() goal!: Goal
  @Input() stakeholder = createGoalStakeholder()

  get canEdit() {
    if (!this.stakeholder.isAdmin && !this.stakeholder.isAchiever) return false
    if (this.milestone.status === 'failed' || this.milestone.status === 'succeeded') return false
    return true
  }

  constructor(
    private alertCtrl: AlertController,
    private cdr: ChangeDetectorRef,
    private milestoneService: MilestoneService,
    private modalCtrl: ModalController
  ) {}

  updateStatus(event: UIEvent) {
    if (!this.goal?.id) return
    if (!this.canEdit) return
    event.stopPropagation()
    
    this.alertCtrl.create({
      header: 'Good job!',
      subHeader: 'Or didn\'t you?',
      buttons: [
        {
          text: 'Succeeded',
          role: 'succeeded',
          handler: () => {
            this.milestoneService.upsert({
              id: this.milestone.id,
              status: 'succeeded',
              finishedAt: serverTimestamp() as any
            }, { params: { goalId: this.goal.id }})
            this.milestone.status = 'succeeded'
            this.cdr.markForCheck()
            this.startPostCreation(this.milestone)
          }
        },
        {
          text: 'Failed',
          role: 'succeeded',
          handler: () => {
            this.milestoneService.upsert({
              id: this.milestone.id,
              status: 'failed',
              finishedAt: serverTimestamp() as any
            }, { params: { goalId: this.goal.id }})
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
    if (!this.goal?.id) return
    this.modalCtrl.create({
      component: UpsertPostModalComponent,
      componentProps: {
        post: createPost({
          goalId: this.goal.id,
          milestoneId: milestone.id
        })
      }
    }).then(modal => modal.present())
  }
}