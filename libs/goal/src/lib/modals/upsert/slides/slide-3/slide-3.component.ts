import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { GoalService } from '@strive/goal/goal.service';
import { GoalForm } from '@strive/goal/forms/goal.form';
import { ImageSelectorComponent } from '@strive/media/components/image-selector/image-selector.component';

@Component({
  selector: '[form][goalId] goal-slide-3',
  templateUrl: './slide-3.component.html',
  styleUrls: ['./slide-3.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Slide3Component {
  @ViewChild(ImageSelectorComponent) imageSelector?: ImageSelectorComponent
  
  @Input() form!: GoalForm
  @Input() goalId!: string

  @Output() stepper = new EventEmitter<'next' | 'previous'>()

  constructor(private goal: GoalService) {}

  step(direction: 'next' | 'previous') {
    if (this.imageSelector?.step.value === 'crop') {
      this.imageSelector.cropIt()
    }

    if (this.form.image.dirty) {
      this.goal.upsert({ id: this.goalId, image: this.form.image.value })
      this.form.image.markAsPristine()
    }
    this.stepper.emit(direction)
  }
}