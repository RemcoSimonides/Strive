import { ChangeDetectionStrategy, Component, ViewChild, ViewEncapsulation } from '@angular/core'
import { Router } from '@angular/router'
import { ModalController } from '@ionic/angular'
import { SwiperComponent } from 'swiper/angular'

import { UpsertGoalModalComponent } from '@strive/goal/goal/components/upsert/upsert.component'
import { PersonalService } from '@strive/user/personal/personal.service'


@Component({
  selector: 'user-auth-welcome-modal',
  templateUrl: './welcome.modal.html',
  styleUrls: ['./welcome.modal.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.ShadowDom
})
export class WelcomeModalComponent {
  @ViewChild('swiper') swiper?: SwiperComponent;

  showStep1$ = this.personalService.fcmIsSupported;
  showStep2 = false;

  constructor(
    private modalCtrl: ModalController,
    private personalService: PersonalService,
    private router: Router
  ) {
    const pages = ['/goal/', '/profile', '/exercise']
    this.showStep2 = !pages.some(value => this.router.url.includes(value))
  }

  dismiss(url?: string) {
    if (url) this.router.navigate([url])
    this.modalCtrl.dismiss()
  }

  next() {
    if (this.swiper?.swiperRef.isEnd) {
      this.dismiss()
    } else {
      this.swiper?.swiperRef.slideNext(100)
    }
  }

  pushNotifications() {
    this.personalService.registerFCM()
    this.next()
  }

  createGoal() {
    this.modalCtrl.dismiss()
    this.modalCtrl.create({
      component: UpsertGoalModalComponent
    }).then(modal => {
      modal.onDidDismiss().then((data) => {
        const navToGoal = data.data?.['navToGoal']
        if (navToGoal) this.router.navigate(['/goal', navToGoal ])
      })
      modal.present()     
    })
  }
}