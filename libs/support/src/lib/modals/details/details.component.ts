import { Location } from '@angular/common'
import { ChangeDetectionStrategy, Component, Input, inject } from '@angular/core'
import { IonContent, ModalController } from '@ionic/angular/standalone'

import { Support } from '@strive/model'
import { SupportDetailsComponent } from '@strive/support/components/details/details.component'
import { HeaderModalComponent } from '@strive/ui/header-modal/header-modal.component'

import { ModalDirective } from '@strive/utils/directives/modal.directive'

@Component({
    selector: 'strive-support-details-modal',
    templateUrl: './details.component.html',
    styleUrls: ['./details.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        SupportDetailsComponent,
        HeaderModalComponent,
        IonContent
    ]
})
export class SupportDetailsModalComponent extends ModalDirective {
  protected override location: Location;
  protected override modalCtrl: ModalController;


  @Input() support?: Support

  constructor() {
    const location = inject(Location);
    const modalCtrl = inject(ModalController);

    super(location, modalCtrl)

    this.location = location;
    this.modalCtrl = modalCtrl;
  }
}
