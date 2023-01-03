import { CommonModule } from "@angular/common"
import { NgModule } from "@angular/core"
import { IonicModule } from "@ionic/angular"

import { SelectUserModalComponent } from './select-user.modal'

@NgModule({
  imports: [
    CommonModule,
    IonicModule
  ],
  declarations: [
    SelectUserModalComponent
  ]
})
export class SelectUserModule {}