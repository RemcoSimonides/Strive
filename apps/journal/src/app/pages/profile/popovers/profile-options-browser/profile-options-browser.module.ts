import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'

import { IonicModule } from '@ionic/angular'

import { ProfileOptionsBrowserComponent } from './profile-options-browser.page'

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
  ],
  declarations: [ProfileOptionsBrowserComponent]
})
export class ProfileOptionsBrowserPageModule {}
