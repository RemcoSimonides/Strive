import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router'
import { HomePageComponent } from './home.page'

import { ImageDirective } from '@strive/media/directives/image.directive'
import { CompactPipe } from '@strive/utils/pipes/compact.pipe'

import { FooterComponent } from '@strive/ui/footer/footer.component'
import { IonContent, IonButton, IonIcon, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonText } from '@ionic/angular/standalone'

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    ImageDirective,
    CompactPipe,
    FooterComponent,
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
