import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component } from '@angular/core'
import { IonicModule } from '@ionic/angular'

@Component({
  standalone: true,
  selector: '[interval] strive-assess-life-outro',
  templateUrl: './outro.component.html',
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
export class AssessLifeOutroComponent {}