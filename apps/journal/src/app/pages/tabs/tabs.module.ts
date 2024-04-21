import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { RouterModule } from '@angular/router'
import { TabsComponent } from './tabs.component'

import { ImageDirective } from '@strive/media/directives/image.directive'
import { IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, IonAvatar } from '@ionic/angular/standalone'

@NgModule({
  imports: [
    CommonModule,
    ImageDirective,
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
