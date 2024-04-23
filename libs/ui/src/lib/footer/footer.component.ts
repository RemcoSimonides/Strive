import { ChangeDetectionStrategy, Component } from '@angular/core'
import { RouterModule } from '@angular/router'

import { addIcons } from 'ionicons'
import { openOutline } from 'ionicons/icons'
import { IonIcon } from '@ionic/angular/standalone'

@Component({
  standalone: true,
  selector: 'strive-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterModule,
    IonIcon
  ]
})
export class FooterComponent {
  constructor() {
    addIcons({ openOutline })
  }
}
