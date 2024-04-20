import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { Routes, RouterModule } from '@angular/router'
import { SupportPageComponent } from './support.page'

import { HeaderModule } from '@strive/ui/header/header.module'
import { SupportDetailsModule } from '@strive/support/components/details/details.module'
import { PagenotfoundComponent } from '@strive/ui/404/404.component'
import { IonContent } from '@ionic/angular/standalone'

const routes: Routes = [
  {
    path: '',
    component: SupportPageComponent
  }
]

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    HeaderModule,
    SupportDetailsModule,
    PagenotfoundComponent,
    IonContent
  ],
  declarations: [
    SupportPageComponent,
  ]
})
export class SupportPageModule { }
