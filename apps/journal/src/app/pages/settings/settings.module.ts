import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { RouterModule, Routes } from '@angular/router'
import { IonicModule } from '@ionic/angular'

import { SettingsPageComponent } from './settings.component'

import { AuthGuardService } from '@strive/auth/guard/auth-guard.service'
import { HeaderModule } from '@strive/ui/header/header.module'
import { ImageModule } from '@strive/media/directives/image.module'

const routes: Routes = [
  {
    path: '',
    component: SettingsPageComponent,
    canActivate: [AuthGuardService]
  }
]

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    RouterModule.forChild(routes),
    HeaderModule,
    ImageModule
  ],
  declarations: [SettingsPageComponent]
})
export class SettingsPageModule {}