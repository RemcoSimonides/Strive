import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { Routes, RouterModule } from '@angular/router'

import { IonicModule } from '@ionic/angular'

import { SupportPageComponent } from './support.page'

import { HeaderModule } from '@strive/ui/header/header.module'
import { SupportDetailsModule } from '@strive/support/components/details/details.module'
import { PagenotfoundModule } from '@strive/ui/404/404.module'

const routes: Routes = [
  {
    path: '',
    component: SupportPageComponent
  }
]

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    RouterModule.forChild(routes),
    HeaderModule,
    SupportDetailsModule,
    PagenotfoundModule
  ],
  declarations: [
    SupportPageComponent,
  ]
})
export class SupportPageModule {}
