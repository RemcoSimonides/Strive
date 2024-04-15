import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { RouterModule } from '@angular/router'

import { HeaderRootComponent } from './header-root.component'
import { ImageModule } from '@strive/media/directives/image.module'
import { MenuModule } from '../menu/menu.module'
import { IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon } from '@ionic/angular/standalone'

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    ImageModule,
    MenuModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonIcon
  ],
  exports: [HeaderRootComponent],
  declarations: [HeaderRootComponent],
})
export class HeaderRootModule { }
