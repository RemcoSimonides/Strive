import { ChangeDetectionStrategy, Component, Input } from '@angular/core'
import { FormControl, ReactiveFormsModule } from '@angular/forms'
import { SelfReflectQuestion } from '@strive/model'
import { SelfReflectReplaceFrequencyPipe } from '../../pipes/frequency.pipe'
import { IonList, IonItem, IonTextarea } from '@ionic/angular/standalone'

@Component({
    selector: 'strive-self-reflect-textarea',
    templateUrl: './textarea.component.html',
    styleUrls: ['./textarea.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        ReactiveFormsModule,
        SelfReflectReplaceFrequencyPipe,
        IonList,
        IonItem,
        IonTextarea
    ]
})
export class SelfReflectTextareaComponent {

  @Input() form?: FormControl<string>
  @Input() question?: SelfReflectQuestion

}
