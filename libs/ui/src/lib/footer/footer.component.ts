import { ChangeDetectionStrategy, Component } from '@angular/core'
import { addIcons } from 'ionicons'
import { openOutline } from 'ionicons/icons'

@Component({
  selector: 'strive-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FooterComponent {
  constructor() {
    addIcons({ openOutline })
  }
}
