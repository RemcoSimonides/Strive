import { Location } from '@angular/common'
import { Component, Input, inject } from '@angular/core'
import { Router, RouterModule } from '@angular/router'

import { Capacitor } from '@capacitor/core'
import { IonAvatar, ModalController } from '@ionic/angular/standalone'

import { ImageDirective } from '@strive/media/directives/image.directive'
import { createSupportBase, Support } from '@strive/model'
import { ArrowBackComponent, ArrowForwardComponent } from '@strive/ui/responsive-arrow/arrow.component'
import { MaxLengthPipe } from '@strive/utils/pipes/max-length.pipe'

@Component({
    selector: 'strive-support-pledge',
    templateUrl: './pledge.component.html',
    styleUrls: ['./pledge.component.scss'],
    imports: [
        RouterModule,
        ArrowBackComponent,
        ArrowForwardComponent,
        ImageDirective,
        MaxLengthPipe,
        IonAvatar
    ]
})
export class PledgeComponent {
  private location = inject(Location);
  private modalCtrl = inject(ModalController);
  private router = inject(Router);

  @Input() support: Support = createSupportBase()

  async navTo(urlTree: string[]) {
    const modal = await this.modalCtrl.getTop()
    if (modal) {
      if (Capacitor.getPlatform() === 'web') { this.location.back() } else { modal.dismiss() }
      await modal.onDidDismiss()
      this.router.navigate(urlTree)
    } else {
      this.router.navigate(urlTree)
    }
  }
}
