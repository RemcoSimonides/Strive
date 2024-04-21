import { NgModule } from '@angular/core'
import { CardsModalComponent } from './cards-modal.component'

import { CardsComponent } from '../../components/cards/cards.component'
import { HeaderModalComponent } from '@strive/ui/header-modal/header-modal.component'
import { ImageModule } from '@strive/media/directives/image.module'
import { IonContent } from '@ionic/angular/standalone'

@NgModule({
  imports: [
    CardsComponent,
    HeaderModalComponent,
    ImageModule,
    IonContent
  ],
  declarations: [CardsModalComponent]
})
export class CardsModalModule { }
