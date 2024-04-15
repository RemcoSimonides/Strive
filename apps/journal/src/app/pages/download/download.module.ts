import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { ImageModule } from '@strive/media/directives/image.module'
import { HeaderModule } from '@strive/ui/header/header.module'

import { DownloadPageComponent } from './download.component'
import { IonContent, IonButton } from '@ionic/angular/standalone'

const routes: Routes = [
  {
    path: '',
    component: DownloadPageComponent
  }
]

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ImageModule,
    HeaderModule,
    IonContent,
    IonButton
  ],
  declarations: [
    DownloadPageComponent
  ]
})
export class DownloadModule {}