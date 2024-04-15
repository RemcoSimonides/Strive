import { CommonModule } from "@angular/common"
import { NgModule } from "@angular/core"
import { RouterModule } from '@angular/router'
import { PagenotfoundComponent } from './404.component'

import { HeaderModule } from '../header/header.module'
import { IonContent, IonButton } from '@ionic/angular/standalone'

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    HeaderModule,
    IonContent,
    IonButton
  ],
  declarations: [PagenotfoundComponent],
  exports: [PagenotfoundComponent]
})
export class PagenotfoundModule { }
