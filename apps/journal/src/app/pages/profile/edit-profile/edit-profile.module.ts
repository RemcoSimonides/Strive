import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule, Routes } from '@angular/router'
import { ReactiveFormsModule } from '@angular/forms'
import { IonicModule } from '@ionic/angular'

import { EditProfileComponent } from './edit-profile.component'

import { ImageSelectorModule } from '@strive/media/components/image-selector/image-selector.module'
import { HeaderModule } from '@strive/ui/header/header.module'

const routes: Routes = [
  { path: '', component: EditProfileComponent },
]

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule,
    ImageSelectorModule,
    HeaderModule
  ],
  declarations: [EditProfileComponent]
})
export class EditProfileModule {}