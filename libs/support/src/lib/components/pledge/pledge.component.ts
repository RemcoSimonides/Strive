import { Location } from '@angular/common'
import { Component, Input } from '@angular/core'
import { Router, RouterModule } from '@angular/router'

import { Capacitor } from '@capacitor/core'
import { IonAvatar, ModalController } from '@ionic/angular/standalone'

import { ImageDirective } from '@strive/media/directives/image.directive'
import { createSupportBase, Support } from '@strive/model'
import { ArrowBackComponent, ArrowForwardComponent } from '@strive/ui/responsive-arrow/arrow.component'
import { MaxLengthPipe } from '@strive/utils/pipes/max-length.pipe'

@Component({
  standalone: true,
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
  @Input() support: Support = createSupportBase()

  constructor(
    private location: Location,
    private modalCtrl: ModalController,
    private router: Router
  ) { }

  async navTo(urlTree: string[]) {
    const modal = await this.modalCtrl.getTop()
    if (modal) {
      Capacitor.getPlatform() === 'web' ? this.location.back() : modal.dismiss()
      await modal.onDidDismiss()
      this.router.navigate(urlTree)
    } else {
      this.router.navigate(urlTree)
    }
  }
}
