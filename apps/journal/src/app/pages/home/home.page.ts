import { ChangeDetectionStrategy, Component } from '@angular/core'
import { ModalController } from '@ionic/angular'

import { exercises } from '@strive/model'
import { PWAService } from '@strive/utils/services/pwa.service'
import { AuthModalComponent, enumAuthSegment } from '@strive/user/auth/components/auth-modal/auth-modal.page'
import { AggregationService } from '@strive/utils/services/aggregation.service'

@Component({
  selector: 'journal-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent {

  exercises = exercises
  enumAuthSegment = enumAuthSegment

  aggregation$ = this.aggregationService.getAggregation$()

  constructor (
    private aggregationService: AggregationService,
    private modalCtrl: ModalController,
    public pwa: PWAService
  ) {}

  openAuthModal() {
    this.modalCtrl.create({
      component: AuthModalComponent,
      componentProps: {
        authSegment: enumAuthSegment.register,
        
      }
    }).then(modal => modal.present())
  }
}