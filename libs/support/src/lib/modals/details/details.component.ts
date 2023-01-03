import { Location } from '@angular/common'
import { ChangeDetectionStrategy, Component, Input } from '@angular/core'
import { ModalController, Platform } from '@ionic/angular'

import { Support } from '@strive/model'

import { ModalDirective } from '@strive/utils/directives/modal.directive'

@Component({
  selector: 'strive-support-details-modal',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SupportDetailsModalComponent extends ModalDirective {

  @Input() support?: Support

  constructor(
    protected override location: Location,
    protected override modalCtrl: ModalController,
    protected override platform: Platform,
  ) {
    super(location, modalCtrl, platform)
  }
}