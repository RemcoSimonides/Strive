import { ChangeDetectionStrategy, Component, ElementRef, ViewChild, ViewEncapsulation } from '@angular/core'
import { Router } from '@angular/router'
import { ModalController } from '@ionic/angular/standalone'
import { addIcons } from 'ionicons'
import { closeOutline } from 'ionicons/icons'
import { Capacitor } from '@capacitor/core'

import { SwiperContainer } from 'swiper/swiper-element'
import { combineLatest, map, of } from 'rxjs'

import { GoalCreateModalComponent } from '@strive/goal/modals/upsert/create/create.component'
import { PersonalService } from '@strive/user/personal.service'
import { ScreensizeService } from '@strive/utils/services/screensize.service'

@Component({
  selector: 'strive-welcome-modal',
  templateUrl: './welcome.modal.html',
  styleUrls: ['./welcome.modal.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.ShadowDom
})
export class WelcomeModalComponent {
  @ViewChild('swiper') swiper?: ElementRef<SwiperContainer>;

  showIOSHeader$ = combineLatest([
    this.screensize.isMobile$,
    of(Capacitor.getPlatform() === 'ios')
  ]).pipe(
    map(([isMobile, isIOS]) => isMobile && isIOS)
  )

  showStep1$ = this.personalService.fcmIsSupported
  showStep2 = false

  constructor(
    private modalCtrl: ModalController,
    private personalService: PersonalService,
    private router: Router,
    private screensize: ScreensizeService
  ) {
    const pages = ['/goal/', '/profile', '/exercise']
    this.showStep2 = !pages.some(value => this.router.url.includes(value))
    addIcons({ closeOutline });
  }

  dismiss(url?: string) {
    if (url) this.router.navigate([url])
    this.modalCtrl.dismiss()
  }

  next() {
    if (!this.swiper) return
    const swiper = this.swiper.nativeElement.swiper

    if (swiper.isEnd) {
      this.dismiss()
    } else {
      swiper.slideNext(100)
    }
  }

  pushNotifications() {
    this.personalService.registerFCM(true, true)
    this.next()
  }

  createGoal() {
    this.modalCtrl.dismiss()
    this.modalCtrl.create({
      component: GoalCreateModalComponent
    }).then(modal => {
      modal.onDidDismiss().then((data) => {
        const navToGoal = data.data?.['navToGoal']
        if (navToGoal) this.router.navigate(['/goal', navToGoal])
      })
      modal.present()
    })
  }
}
