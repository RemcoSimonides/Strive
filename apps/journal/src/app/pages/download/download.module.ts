import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { IonicModule } from '@ionic/angular'
import { ImageModule } from '@strive/media/directives/image.module'
import { HeaderModule } from '@strive/ui/header/header.module'

import { DownloadComponent } from './download.component'

const routes: Routes = [
  {
    path: '',
    component: DownloadComponent
  }
]

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    RouterModule.forChild(routes),
    ImageModule,
    HeaderModule
  ],
  declarations: [
    DownloadComponent
  ]
})
export class DownloadModule {}