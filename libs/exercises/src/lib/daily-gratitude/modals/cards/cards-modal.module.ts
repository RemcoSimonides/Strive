import { NgModule } from '@angular/core'
import { IonicModule } from '@ionic/angular'

import { CardsModalComponent } from './cards-modal.component'

import { CardsModule } from '../../components/cards/cards.module'
import { HeaderModalComponent } from '@strive/ui/header-modal/header-modal.component'
import { ImageModule } from '@strive/media/directives/image.module'

@NgModule({
  imports: [
    IonicModule,
    CardsModule,
    HeaderModalComponent,
    ImageModule
  ],
  declarations: [CardsModalComponent]
})
export class CardsModalModule {}