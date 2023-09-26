import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, Input } from '@angular/core'
import { IonicModule } from '@ionic/angular'
import { AssessLifeInterval } from '@strive/model'

@Component({
  standalone: true,
  selector: '[interval] strive-assess-life-intro',
  templateUrl: './intro.component.html',
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      gap: 32px;
      justify-content: center;
      max-width: 300px;
      margin: auto;
      height: 100%;
      text-align: center;
    }`
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    IonicModule
  ]
})
export class AssessLifeIntroComponent {

  @Input() interval?: AssessLifeInterval

}