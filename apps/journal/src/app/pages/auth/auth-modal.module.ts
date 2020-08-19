import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AuthModalPageRoutingModule } from './auth-modal-routing.module';

import { AuthModalPage } from './auth-modal.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AuthModalPageRoutingModule
  ],
  declarations: [AuthModalPage]
})
export class LoginModalPageModule {}
