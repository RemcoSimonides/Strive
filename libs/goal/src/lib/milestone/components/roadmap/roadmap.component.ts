import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { ItemReorderEventDetail, ModalController } from '@ionic/angular';
import { Goal } from '@strive/goal/goal/+state/goal.firestore';

import { createMilestone, Milestone } from '@strive/goal/milestone/+state/milestone.firestore';
import { MilestoneService } from '@strive/goal/milestone/+state/milestone.service';
import { MilestoneForm } from '@strive/goal/milestone/forms/milestone.form';

import { AddSupportModalComponent } from '@strive/support/components/add/add.component';
import { boolean } from '@strive/utils/decorators/decorators';
import { DetailsComponent } from '../details/details.component';

@Component({
  selector: '[goal][milestones][isAdmin] goal-strive-roadmap',
  templateUrl: 'roadmap.component.html',
  styleUrls: ['./roadmap.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RoadmapComponent {

  @Input() goal: Goal
  @Input() milestones: Milestone[]
  @Input() isAdmin: boolean
  @Input() isAchiever: boolean

  @Input() @boolean createMode = false

  @Output() changeStatus = new EventEmitter<Milestone>()

  milestoneForm = new MilestoneForm()

  constructor(
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
    if (this.milestoneForm.value) {
      this.milestoneForm.get('order').setValue(this.milestones.length)
      const milestone = createMilestone(this.milestoneForm.value)
      this.milestone.add(milestone, { params: { goalId: this.goal.id }})
      this.milestoneForm.reset(createMilestone())
    }
  }

  openDetails(milestone: Milestone) {
    this.modalCtrl.create({
      component: DetailsComponent,
      componentProps: {
        goal: this.goal,
        isAdmin: this.isAdmin,
        isAchiever: this.isAchiever,
        milestone
      },
      initialBreakpoint: 0.3,
      breakpoints: [0, 0.3, 1]
    }).then(modal => modal.present())
  }

  updateDeadline(milestone: Milestone, deadline: string) {
    milestone.deadline = deadline
    this.milestone.upsert({ deadline, id: milestone.id }, { params: { goalId: this.goal.id }})
  }

  openSupportModal(event: Event, milestone: Milestone) {
    if (milestone.status !== 'pending') return
    event.stopPropagation()
  
    this.modalCtrl.create({
      component: AddSupportModalComponent,
      componentProps: {
        goalId: this.goal.id,
        milestone
      }
    }).then(modal => modal.present())
  }

}