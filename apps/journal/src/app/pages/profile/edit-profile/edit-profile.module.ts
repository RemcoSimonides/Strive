import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule, Routes } from '@angular/router'
import { ReactiveFormsModule } from '@angular/forms'
import { EditProfilePageComponent } from './edit-profile.component'

import { ImageSelectorModule } from '@strive/media/components/image-selector/image-selector.module'
import { HeaderModule } from '@strive/ui/header/header.module'
import { IonContent, IonCard, IonCardContent, IonItem, IonInput, IonButton } from '@ionic/angular/standalone'

const routes: Routes = [
  { path: '', component: EditProfilePageComponent },
]

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule,
    ImageSelectorModule,
    HeaderModule,
    IonContent,
    IonCard,
    IonCardContent,
    IonItem,
    IonInput,
    IonButton
  ],
  declarations: [EditProfilePageComponent]
})
export class EditProfilePageModule { }
