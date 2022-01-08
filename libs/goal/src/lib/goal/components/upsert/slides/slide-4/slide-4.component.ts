import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Goal } from '@strive/goal/goal/+state/goal.firestore';
import { Milestone } from '@strive/goal/milestone/+state/milestone.firestore';
import { MilestoneService } from '@strive/goal/milestone/+state/milestone.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'goal-slide-4',
  templateUrl: './slide-4.component.html',
  styleUrls: ['./slide-4.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Slide4Component implements OnInit {
  @Input() goal: Goal

  @Output() stepper = new EventEmitter<'next' | 'previous'>()

  milestones$: Observable<Milestone[]>

  constructor(
    private milestoneService: MilestoneService
  ) {}

  ngOnInit() {
    this.milestones$ = this.milestoneService.valueChanges({ goalId: this.goal.id })
  }

  step(direction: 'next' | 'previous') {
    this.stepper.emit(direction)
  }
}