import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, Input } from '@angular/core'
import { FormControl, ReactiveFormsModule } from '@angular/forms'
import { IonicModule } from '@ionic/angular'
import { AssessLifeQuestion } from '@strive/model'
import { AssessLifeReplaceIntervalPipe } from '../../pipes/interval.pipe'

@Component({
  standalone: true,
  selector: 'strive-assess-life-textarea',
  templateUrl: './textarea.component.html',
  styleUrls: ['./textarea.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    IonicModule,
    ReactiveFormsModule,
    AssessLifeReplaceIntervalPipe
  ]
})
export class AssessLifeTextareaComponent {

  @Input() form?: FormControl<string>
  @Input() question?: AssessLifeQuestion

}