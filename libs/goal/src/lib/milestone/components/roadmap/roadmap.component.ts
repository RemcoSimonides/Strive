import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core'
import { ItemReorderEventDetail, ModalController } from '@ionic/angular'
import { createGoalStakeholder, Goal, Support } from '@strive/model'

import { createMilestone, Milestone } from '@strive/model'
import { MilestoneForm } from '@strive/goal/milestone/forms/milestone.form'

import { MilestoneService } from '@strive/goal/milestone/milestone.service'
import { AuthService } from '@strive/user/auth/auth.service'

import { AddSupportModalComponent } from '@strive/support/components/add/add.component'
import { DetailsComponent } from '../details/details.component'
import { AuthModalComponent, enumAuthSegment } from '@strive/user/auth/components/auth-modal/auth-modal.page'

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

  constructor(
    private auth: AuthService,
    private modalCtrl: ModalController,
    private milestone: MilestoneService
  ) {}

  trackByFn(index: number, milestone: Milestone) {
    return milestone.id
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
        goalId: this.goal.id,
        milestone
      }
    }).then(modal => modal.present())
  }
}