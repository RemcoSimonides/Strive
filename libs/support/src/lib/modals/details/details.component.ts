import { CommonModule, Location } from '@angular/common'
import { ChangeDetectionStrategy, Component, Input } from '@angular/core'
import { ModalController } from '@ionic/angular/standalone'

import { Support } from '@strive/model'
import { SupportDetailsComponent } from '@strive/support/components/details/details.component'
import { HeaderModalComponent } from '@strive/ui/header-modal/header-modal.component'

import { ModalDirective } from '@strive/utils/directives/modal.directive'

@Component({
  standalone: true,
  selector: 'strive-support-details-modal',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    SupportDetailsComponent,
    HeaderModalComponent
  ]
})
export class SupportDetailsModalComponent extends ModalDirective {

  @Input() support?: Support

  constructor(
    protected override location: Location,
    protected override modalCtrl: ModalController
  ) {
    super(location, modalCtrl)
  }
}
