import { ChangeDetectionStrategy, Component } from '@angular/core'

import { IonContent } from '@ionic/angular/standalone'

import { ModalDirective } from '@strive/utils/directives/modal.directive'
import { CardsComponent } from '../../components/cards/cards.component'
import { HeaderModalComponent } from '@strive/ui/header-modal/header-modal.component'
import { ImageModule } from '@strive/media/directives/image.module'

@Component({
  standalone: true,
  selector: 'strive-daily-gratitude-cards-modal',
  templateUrl: './cards-modal.component.html',
  styleUrls: ['./cards-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CardsComponent,
    HeaderModalComponent,
    ImageModule,
    IonContent
  ]
})
export class CardsModalComponent extends ModalDirective {
}