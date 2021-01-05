import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ReactiveFormsModule } from '@angular/forms';

import { CreateTemplateModalPage } from './create-template-modal.page';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    ReactiveFormsModule
  ],
  exports: [],
  declarations: [CreateTemplateModalPage]
})
export class CreateTemplateModalPageModule { }
