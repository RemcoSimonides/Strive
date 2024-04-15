import { DOCUMENT, isPlatformBrowser } from '@angular/common'
import { ChangeDetectionStrategy, Component, Inject, PLATFORM_ID } from '@angular/core'
import { Capacitor } from '@capacitor/core'
import { ModalController, Platform } from '@ionic/angular/standalone'
import { addIcons } from 'ionicons'
import { arrowForwardOutline, moonOutline, sunnyOutline } from 'ionicons/icons'

import { AuthModalComponent, enumAuthSegment } from '@strive/auth/components/auth-modal/auth-modal.page'
import { AggregationService } from '@strive/utils/services/aggregation.service'
import { SeoService } from '@strive/utils/services/seo.service'
import { ThemeService } from '@strive/utils/services/theme.service'

@Component({
  selector: 'journal-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomePageComponent {

  enumAuthSegment = enumAuthSegment

  aggregation$ = this.aggregationService.valueChanges()

  showPlayStore = Capacitor.getPlatform() === 'web' && !this.platform.platforms().includes('ios')
  showAppStore = Capacitor.getPlatform() === 'web' && !this.platform.platforms().includes('android')

  theme$ = this.themeService.theme$

  constructor(
    private aggregationService: AggregationService,
    private modalCtrl: ModalController,
    private platform: Platform,
    seo: SeoService,
    private themeService: ThemeService,
    @Inject(PLATFORM_ID) platformId: any,
    @Inject(DOCUMENT) document: Document
  ) {
    seo.generateTags({})
    if (isPlatformBrowser(platformId)) {
      const observer = new IntersectionObserver(entries => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('show')
          }
        })
      })

      setTimeout(() => {
        const elements = document.querySelectorAll('.fade')
        elements.forEach(el => observer.observe(el))
      }, 800)
    }
    addIcons({ arrowForwardOutline, moonOutline, sunnyOutline });
  }

  openAuthModal() {
    this.modalCtrl.create({
      component: AuthModalComponent,
      componentProps: {
        authSegment: enumAuthSegment.register
      }
    }).then(modal => modal.present())
  }

  toggleTheme() {
    this.themeService.toggle()
  }
}
