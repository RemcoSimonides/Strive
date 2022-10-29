import { NgModule } from '@angular/core'
import { IonicModule } from '@ionic/angular'

import { CardsModalComponent } from './cards-modal.component'

import { CardsModule } from '../../components/cards/cards.module'
import { HeaderModule } from '@strive/ui/header/header.module'
import { ImageModule } from '@strive/media/directives/image.module'

@NgModule({
  imports: [
    IonicModule,
    CardsModule,
    HeaderModule,
    ImageModule
  ],
  declarations: [CardsModalComponent]
})
export class CardsModalModule {}