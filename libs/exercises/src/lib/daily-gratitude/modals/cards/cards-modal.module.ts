import { NgModule } from '@angular/core'
import { CardsModalComponent } from './cards-modal.component'

import { CardsModule } from '../../components/cards/cards.module'
import { HeaderModalComponent } from '@strive/ui/header-modal/header-modal.component'
import { ImageModule } from '@strive/media/directives/image.module'
import { IonContent } from '@ionic/angular/standalone'

@NgModule({
  imports: [
    CardsModule,
    HeaderModalComponent,
    ImageModule,
    IonContent
  ],
  declarations: [CardsModalComponent]
})
export class CardsModalModule { }
