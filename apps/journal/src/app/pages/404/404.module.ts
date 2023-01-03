import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule, Routes } from '@angular/router'
import { IonicModule } from '@ionic/angular'

import { NotfoundPageComponent } from './404.component'
import { HeaderModule } from '@strive/ui/header/header.module'

import { PagenotfoundModule } from '@strive/ui/404/404.module'

const routes: Routes = [
  {
    path: '',
    component: NotfoundPageComponent
  }
]

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    PagenotfoundModule,
    HeaderModule,
    RouterModule.forChild(routes)
  ],
  declarations: [NotfoundPageComponent],
  exports: [NotfoundPageComponent]
})
export class NotfoundPageModule {}