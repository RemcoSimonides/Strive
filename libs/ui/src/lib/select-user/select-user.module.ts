import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { IonicModule } from "@ionic/angular";

import { SelectUserModal } from './select-user.modal';

@NgModule({
  imports: [
    CommonModule,
    IonicModule
  ],
  declarations: [
    SelectUserModal
  ]
})
export class SelectUserModule {}