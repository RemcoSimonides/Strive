import { CommonModule } from '@angular/common';
import { Component } from '@angular/core'
import { Router } from '@angular/router'

import { ModalController, PopoverController, IonList, IonItem, IonLabel, IonIcon } from '@ionic/angular/standalone'
import { addIcons } from 'ionicons'
import { downloadOutline } from 'ionicons/icons'

import { getAuth } from 'firebase/auth'

import { AuthService } from '@strive/auth/auth.service'
import { AuthModalComponent, enumAuthSegment } from '@strive/auth/components/auth-modal/auth-modal.page'
import { PWAService } from '@strive/utils/services/pwa.service'
import { ThemeService } from '@strive/utils/services/theme.service'

@Component({
  standalone: true,
  selector: 'journal-profile-options-popover',
  templateUrl: './profile-options.component.html',
  imports: [
    CommonModule,
    IonList,
    IonItem,
    IonLabel,
    IonIcon
  ]
})
export class ProfileOptionsComponent {

  constructor(
    private auth: AuthService,
    private modalCtrl: ModalController,
    private popoverCtrl: PopoverController,
    public pwa: PWAService,
    private router: Router,
    private themeService: ThemeService
  ) {
    addIcons({ downloadOutline });
  }

  goTo(url: string) {
    this.router.navigateByUrl(url)
    this.popoverCtrl.dismiss()
  }

  goToProfile() {
    this.router.navigateByUrl(`/profile/${this.auth.uid}`)
    this.popoverCtrl.dismiss()
  }

  async signOut() {
    await getAuth().signOut()
    this.popoverCtrl.dismiss()

    this.modalCtrl.create({
      component: AuthModalComponent,
      componentProps: {
        authSegment: enumAuthSegment.login
      }
    }).then(modal => modal.present())
  }

  toggleTheme() {
    this.themeService.toggle()
    this.popoverCtrl.dismiss()
  }
}
