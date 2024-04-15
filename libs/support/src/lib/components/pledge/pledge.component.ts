import { Location } from '@angular/common'
import { Component, Input } from '@angular/core'
import { Router } from '@angular/router'
import { Capacitor } from '@capacitor/core'
import { ModalController } from '@ionic/angular/standalone'
import { createSupportBase, Support } from '@strive/model'

@Component({
  selector: 'strive-support-pledge',
  templateUrl: './pledge.component.html',
  styleUrls: ['./pledge.component.scss']
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
