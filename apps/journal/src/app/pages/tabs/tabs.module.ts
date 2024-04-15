import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { RouterModule } from '@angular/router'
import { TabsComponent } from './tabs.component'

import { ImageModule } from '@strive/media/directives/image.module'
import { IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, IonAvatar } from '@ionic/angular/standalone'

@NgModule({
  imports: [
    CommonModule,
    ImageModule,
    RouterModule,
    IonTabs,
    IonTabBar,
    IonTabButton,
    IonIcon,
    IonLabel,
    IonAvatar
  ],
  declarations: [
    TabsComponent
  ]
})
export class TabsModule { }
