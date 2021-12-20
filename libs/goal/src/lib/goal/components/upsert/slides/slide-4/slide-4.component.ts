import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, QueryList, ViewChildren } from '@angular/core';
import { FormArray } from '@angular/forms';
import { GoalService } from '@strive/goal/goal/+state/goal.service';
import { GoalForm } from '@strive/goal/goal/forms/goal.form';
import { MilestoneTemplate } from '@strive/milestone/+state/milestone.firestore';
import { getNrOfDotsInSeqno } from '@strive/milestone/+state/milestone.model';
import { MilestoneService } from '@strive/milestone/+state/milestone.service';
import { MilestoneTemplateForm } from '@strive/milestone/forms/milestone.form';
import { RoadmapService } from '@strive/milestone/+state/roadmap.service';

@Component({
  selector: 'slide-4',
  templateUrl: './slide-4.component.html',
  styleUrls: ['./slide-4.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Slide4 {
  @ViewChildren('datetime') dateControllers: QueryList<any>;
  
  @Input() form: GoalForm
  @Input() goalId: string

  @Output() stepper = new EventEmitter<'next' | 'previous'>()

  milestoneForm = new MilestoneTemplateForm()
  roadmapForm = new FormArray([])

  constructor(
    private goal: GoalService,
    private roadmap: RoadmapService,
    private milestoneService: MilestoneService
  ) {
    this.roadmapForm.valueChanges.subscribe(console.log)
  }

  step(direction: 'next' | 'previous') {
    if (this.roadmapForm.dirty) {
      this.goal.upsert({ id: this.goalId, roadmapTemplate: this.roadmapForm.value })
      this.roadmap.startConversion(this.goalId, this.roadmapForm.value)
      this.roadmapForm.markAsPristine()
    }
    this.stepper.emit(direction)
  }

  addMilestone() {
    if (this.milestoneForm.invalid) return

    const { sequenceNumber, description } = this.milestoneForm.value as MilestoneTemplate

    const id = this.milestoneService.createId()
    const control = new MilestoneTemplateForm({ id, sequenceNumber, description })
    this.roadmapForm.insert(this.roadmapForm.length, control)
    this.roadmapForm.markAsDirty()

    this.milestoneForm.incrementSeqNo(1)
    this.milestoneForm.description.reset()
  }

  async deleteMilestone(sequenceNumber: string): Promise<void> {
    const index = this.roadmapForm.controls.findIndex(control => control.value.sequenceNumber === sequenceNumber)
    this.roadmapForm.removeAt(index)
      this.resetSequenceNumbers()
      this.milestoneForm.incrementSeqNo(-1)
  }

  openDateTime(index: number) {
    const control = this.dateControllers.get(index)
    control.open()
  }

  openingDatetime($event, milestone: MilestoneTemplate) {
    event.stopPropagation(); //prevents roadmap from collapsing in or out :)

    // empty value
    $event.target.value = ""

    // set min
    $event.target.min = new Date().toISOString()

    // set max
    // if (this.goal.deadline) $event.target.max = this.goal.deadline

    const elements = milestone.sequenceNumber.split('.')
    if (elements.length !== 1) {
      // if milestone is a submilestone, then max date cannot be later than parent milestone deadline
      elements.pop()
      const parentSeqNo = elements.join('.')
      const rodmapTemplate: MilestoneTemplate[] = this.roadmapForm.value;
      const parent = rodmapTemplate.find(milestone => milestone.sequenceNumber === parentSeqNo)
      if (parent.deadline) $event.target.max = parent.deadline
    }
  }

  private resetSequenceNumbers() {

    let counter1 = 1
    let counter2 = 1
    let counter3 = 1

    for (const ctrl of this.roadmapForm.controls) {
      switch (getNrOfDotsInSeqno(ctrl.value.sequenceNumber)) {
        //Level one milestone
        case 0:
          ctrl.get('sequenceNumber').setValue(`${counter1}`)
          counter1++
          counter2 = 1
          counter3 = 1
          break
        //Level two milestone
        case 1:
          ctrl.get('sequenceNumber').setValue(`${counter1 - 1}.${counter2}`)
          counter2++
          counter3 = 1
          break
        //Level three milestone
        case 2:
          if (counter2 === 1) {
            // This is triggered when the milestone above is two levels above the new one. Then the (current) seqno gets converted to a level 2 instead of level 3
            // Counter would otherwise already have been increased by 1 in the previous case
            ctrl.get('sequenceNumber').setValue(`${counter1 - 1}.${counter2}`)
            counter2++
            counter3 = 1

          } else {
            ctrl.get('sequenceNumber').setValue(`${counter1 - 1}.${counter2 - 1}.${counter3}`)
            counter3++
          }
          break
      }
    }
  }
}