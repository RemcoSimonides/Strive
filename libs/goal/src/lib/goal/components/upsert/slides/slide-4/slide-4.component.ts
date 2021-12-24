import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Milestone } from '@strive/milestone/+state/milestone.firestore';
import { MilestoneService } from '@strive/milestone/+state/milestone.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'slide-4',
  templateUrl: './slide-4.component.html',
  styleUrls: ['./slide-4.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Slide4 implements OnInit {
  @Input() goalId: string

  @Output() stepper = new EventEmitter<'next' | 'previous'>()

  milestones$: Observable<Milestone[]>

  constructor(
    private milestoneService: MilestoneService
  ) {}

  ngOnInit() {
    this.milestones$ = this.milestoneService.valueChanges({ goalId: this.goalId })
  }

  step(direction: 'next' | 'previous') {
    this.stepper.emit(direction)
  }

  async deleteMilestone(sequenceNumber: string): Promise<void> {
    // TODO 
    // const index = this.roadmapForm.controls.findIndex(control => control.value.sequenceNumber === sequenceNumber)
    // this.roadmapForm.removeAt(index)
    //   this.resetSequenceNumbers()
    //   this.milestoneForm.incrementSeqNo(-1)
  }
}