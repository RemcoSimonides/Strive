import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core'
import { IonicModule } from '@ionic/angular'
import { ScreensizeService } from '@strive/utils/services/screensize.service'

@Component({
  standalone: true,
  selector: 'strive-header-modal',
  templateUrl: './header-modal.component.html',
  styleUrls: ['./header-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    IonicModule
  ]
})
export class HeaderModalComponent {

  isDesktop$ = this.screensize.isDesktop$
  @Input() color = ''
  @Input() transparent = false

  @Output() dismiss =  new EventEmitter()

  constructor(
    private screensize: ScreensizeService
  ) {}
}