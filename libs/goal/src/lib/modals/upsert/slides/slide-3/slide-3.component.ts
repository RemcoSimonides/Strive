import { ChangeDetectionStrategy, Component, Input, ViewChild } from '@angular/core'
import { GoalForm } from '@strive/goal/forms/goal.form'
import { ImageSelectorComponent } from '@strive/media/components/image-selector/image-selector.component'

@Component({
  selector: '[form][goalId] strive-goal-slide-3',
  templateUrl: './slide-3.component.html',
  styleUrls: ['./slide-3.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Slide3Component {
  @ViewChild(ImageSelectorComponent) imageSelector?: ImageSelectorComponent

  @Input() form!: GoalForm
  @Input() goalId!: string

  cropImage() {
    if (this.imageSelector?.step.value === 'crop') {
      this.imageSelector.cropIt()
    }
  }
}