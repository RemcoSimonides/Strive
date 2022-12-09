import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core'
import { AlertController, ItemReorderEventDetail, ModalController } from '@ionic/angular'
import { createGoalStakeholder, createPost, Goal, MilestoneStatus, Support } from '@strive/model'

import { serverTimestamp } from 'firebase/firestore'

import { createMilestone, Milestone } from '@strive/model'
import { MilestoneForm } from '@strive/goal/milestone/forms/milestone.form'

import { MilestoneService } from '@strive/goal/milestone/milestone.service'
import { AuthService } from '@strive/user/auth/auth.service'

import { AddSupportModalComponent } from '@strive/support/modals/add/add.component'
import { DetailsComponent } from '../details/details.component'
import { AuthModalComponent, enumAuthSegment } from '@strive/user/auth/components/auth-modal/auth-modal.page'
import { UpsertPostModalComponent } from '@strive/post/components/upsert-modal/upsert-modal.component'

type MilestoneWithSupport = Milestone & { supports?: Support[] }

@Component({
  selector: '[goal][milestones][stakeholder] goal-strive-roadmap',
  templateUrl: 'roadmap.component.html',
  styleUrls: ['./roadmap.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RoadmapComponent {

  @Input() goal!: Goal
  @Input() milestones!: MilestoneWithSupport[]

  @Input() stakeholder = createGoalStakeholder()

  @Input() createMode = false

  @Output() changeStatus = new EventEmitter<Milestone>()

  milestoneForm = new MilestoneForm()

  get canEdit(): boolean {
    return this.stakeholder.isAdmin || this.stakeholder.isAchiever
  }

  constructor(
    private alertCtrl: AlertController,
    private auth: AuthService,
    private cdr: ChangeDetectorRef,
    private modalCtrl: ModalController,
    private milestone: MilestoneService
  ) {}

  trackByFn(index: number, milestone: Milestone) {
    return milestone.id
  }

  updateStatus(milestone: Milestone, event: UIEvent) {
    if (!this.canEdit) return
    if (milestone.status === 'failed' || milestone.status === 'succeeded') return

    event.stopPropagation()

    const openPostModal = () => {
      this.modalCtrl.create({
        component: UpsertPostModalComponent,
        componentProps: {
          post: createPost({
            id: milestone.id,
            goalId: this.goal.id,
            milestoneId: milestone.id
          })
        }
      }).then(modal => modal.present())
    }

    const getHandler = (status: MilestoneStatus) => {
      return () => {
        this.milestone.upsert({
          id: milestone.id,
          status,
          finishedAt: serverTimestamp() as any
        }, { params: { goalId: this.goal.id }})
        milestone.status = status
        this.cdr.markForCheck()
        openPostModal()
      }
    }

    this.alertCtrl.create({
      header: 'Good job!',
      subHeader: 'Or didn\'t you?',
      buttons: [
        {
          text: 'Succeeded',
          role: 'succeeded',
          handler: getHandler('succeeded')
        },
        {
          text: 'Failed',
          role: 'succeeded',
          handler: getHandler('failed')
        },
        {
          text: 'Cancel',
          role: 'cancel',
        },
      ]
    }).then(alert => alert.present())
  }

  doReorder(ev: CustomEvent<ItemReorderEventDetail>) {
    const { from, to } = ev.detail

    const element = this.milestones[from]
    this.milestones.splice(from, 1)
    this.milestones.splice(to, 0, element)

    this.milestones.forEach(((milestone, index) => { milestone.order = index }))

    const min = Math.min(from, to)
    const max = Math.max(from, to)
    const milestonesToUpdate = this.milestones.filter(milestone => milestone.order >= min && milestone.order <= max).map(milestone => ({ id: milestone.id, order: milestone.order }))

    this.milestone.update(milestonesToUpdate, { params: { goalId: this.goal.id }})
    ev.detail.complete()
  }

  add() {
    if (this.milestoneForm.content.value) {
      this.milestoneForm.order.setValue(this.milestones.length)
      const milestone = createMilestone({
        ...this.milestoneForm.getRawValue(),
        status: this.goal.isFinished && this.createMode ? 'succeeded' : 'pending'
      })
      this.milestone.add(milestone, { params: { goalId: this.goal.id }})
      this.milestoneForm.reset(createMilestone())
    }
  }

  openDetails(milestone: Milestone) {
    this.modalCtrl.create({
      component: DetailsComponent,
      componentProps: {
        goal: this.goal,
        stakeholder: this.stakeholder,
        milestone
      },
      cssClass: 'high-modal'
    }).then(modal => modal.present())
  }

  async openSupportModal(event: Event, milestone: Milestone) {
    if (milestone.status !== 'pending') return
    event.stopPropagation()

    if (!this.auth.uid) {
      const modal = await this.modalCtrl.create({
        component: AuthModalComponent,
        componentProps: {
          authSegment: enumAuthSegment.login
        }
      })
      modal.onDidDismiss().then(({ data: loggedIn }) => {
        if (loggedIn) this.openSupportModal(event, milestone)
      })
      return modal.present()
    }

    this.modalCtrl.create({
      component: AddSupportModalComponent,
      componentProps: {
        goal: this.goal,
        milestone
      }
    }).then(modal => modal.present())
  }
}