import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, Input } from '@angular/core'
import { FormControl, ReactiveFormsModule } from '@angular/forms'
import { IonicModule } from '@ionic/angular'
import { SelfReflectQuestion } from '@strive/model'
import { SelfReflectReplaceFrequencyPipe } from '../../pipes/frequency.pipe'

@Component({
  standalone: true,
  selector: 'strive-self-reflect-textarea',
  templateUrl: './textarea.component.html',
  styleUrls: ['./textarea.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    IonicModule,
    ReactiveFormsModule,
    SelfReflectReplaceFrequencyPipe
  ]
})
export class SelfReflectTextareaComponent {

  @Input() form?: FormControl<string>
  @Input() question?: SelfReflectQuestion

}