import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { AddSupportModalPage } from './add-support-modal.page';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule,
    FontAwesomeModule
  ],
  declarations: [
    AddSupportModalPage
  ]
})
export class AddSupportModalPageModule {}
