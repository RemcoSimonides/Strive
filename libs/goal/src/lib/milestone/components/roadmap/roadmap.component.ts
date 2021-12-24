import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ModalController } from '@ionic/angular';

import { createMilestone, Milestone } from '@strive/milestone/+state/milestone.firestore';
import { MilestoneService } from '@strive/milestone/+state/milestone.service';
import { MilestoneForm } from '@strive/milestone/forms/milestone.form';

import { AddSupportModalComponent } from '@strive/support/components/add/add.component';
import { boolean } from '@strive/utils/decorators/decorators';

@Component({
  selector: '[goalId][milestones][isAdmin] strive-roadmap',
  templateUrl: 'roadmap.component.html',
  styleUrls: ['./roadmap.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RoadmapComponent {

  @Input() goalId: string
  @Input() milestones: Milestone[]
  @Input() isAdmin: boolean

  @Input() @boolean createMode = false

  @Output() changeStatus = new EventEmitter<Milestone>()

  milestoneForm = new MilestoneForm()

  constructor(
    private modalCtrl: ModalController,
    private milestone: MilestoneService,
  ) {}

  add() {
    const milestone = createMilestone(this.milestoneForm.value)
    this.milestone.add(milestone, { params: { goalId: this.goalId }})
    this.milestoneForm.reset(createMilestone())
  }

  updateDeadline(milestone: Milestone, deadline: string) {
    milestone.deadline = deadline
    this.milestone.upsert({ deadline, id: milestone.id }, { params: { goalId: this.goalId }})
  }

  updateStatus(milestone: Milestone, event: Event) {
    if (milestone.status !== 'pending' && milestone.status !== 'overdue') return
    if (!this.isAdmin) return
    event.stopPropagation()
    this.changeStatus.emit(milestone)
  }

  openSupportModal(event: Event, milestone: Milestone) {
    if (milestone.status !== 'pending') return
    event.stopPropagation()
  
    this.modalCtrl.create({
      component: AddSupportModalComponent,
      componentProps: {
        goalId: this.goalId,
        milestone
      }
    }).then(modal => modal.present())
  }

  async openOptions(event: Event, context: Milestone, index: number[]) {
    // event.stopPropagation() //prevents roadmap from collapsing in or out :)
  
    // // TODO lets see if we can do it without this popover
    // const popover = await this.popoverCtrl.create({
    //   component: MilestoneOptionsPopover,
    //   event: event,
    //   componentProps: {
    //     goalId: this.goal.id,
    //     milestone: context
    //   }
    // })
    // popover.onDidDismiss().then(data => {
    //   if (!data.data) return
    //   const milestone = this.getMilestone(index)
    //   milestone.achiever = data.data.achiever

    //   this.milestone.upsert({ achiever: data.data.achiever, id: context.id }, { params: { goalId: this.goal.id }})
    //   this.cdr.markForCheck();
    // })
    // popover.present()
  }
}