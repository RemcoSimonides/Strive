import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router'
import { HomePageComponent } from './home.page'

import { ImageModule } from '@strive/media/directives/image.module'
import { CompactPipeModule } from '@strive/utils/pipes/compact.pipe'

import { FooterModule } from '@strive/ui/footer/footer.module'
import { IonContent, IonButton, IonIcon, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonText } from '@ionic/angular/standalone'

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    ImageModule,
    CompactPipeModule,
    FooterModule,
    IonContent,
    IonButton,
    IonIcon,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonText
  ],
  declarations: [HomePageComponent],
  exports: [HomePageComponent]
})
export class HomePageModule { }
