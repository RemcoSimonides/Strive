import { ChangeDetectionStrategy, Component } from '@angular/core'
import { ModalController } from '@ionic/angular'

import { AuthModalComponent, enumAuthSegment } from '@strive/user/auth/components/auth-modal/auth-modal.page'
import { AggregationService } from '@strive/utils/services/aggregation.service'

@Component({
  selector: 'journal-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent {

  enumAuthSegment = enumAuthSegment

  aggregation$ = this.aggregationService.getAggregation$()

  constructor (
    private aggregationService: AggregationService,
    private modalCtrl: ModalController,
  ) {
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

  openAuthModal() {
    this.modalCtrl.create({
      component: AuthModalComponent,
      componentProps: {
        authSegment: enumAuthSegment.register,
        
      }
    }).then(modal => modal.present())
  }
}