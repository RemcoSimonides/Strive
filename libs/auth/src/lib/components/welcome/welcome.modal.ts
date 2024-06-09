import { CommonModule } from '@angular/common'
import { CUSTOM_ELEMENTS_SCHEMA, ChangeDetectionStrategy, Component, ElementRef, ViewChild, ViewEncapsulation } from '@angular/core'
import { Router } from '@angular/router'

import { IonHeader, IonToolbar, IonButtons, IonButton, IonIcon, ModalController } from '@ionic/angular/standalone'
import { addIcons } from 'ionicons'
import { closeOutline } from 'ionicons/icons'

import { Capacitor } from '@capacitor/core'

import { SwiperContainer } from 'swiper/swiper-element'
import { combineLatest, map, of } from 'rxjs'

import { PersonalService } from '@strive/user/personal.service'
import { ScreensizeService } from '@strive/utils/services/screensize.service'
import { ImageDirective } from '@strive/media/directives/image.directive'

@Component({
  standalone: true,
  selector: 'strive-welcome-modal',
  templateUrl: './welcome.modal.html',
  styleUrls: ['./welcome.modal.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.ShadowDom,
  imports: [
    CommonModule,
    ImageDirective,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonButton,
    IonIcon
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
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
    // Navigating to goals page instead of directly opening create goal modal to not have an infinite loop AuthModal > WelcomeModal > CreateGoal > Roadmap > ... > AuthModal
    this.router.navigate(['/goals'], { queryParams: { t: 'create' }})
  }
}
