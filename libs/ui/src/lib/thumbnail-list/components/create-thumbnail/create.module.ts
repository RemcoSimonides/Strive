import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';

import { CreateThumbnailComponent } from './create.component';
import { CreateTemplateModalPageModule } from 'apps/journal/src/app/pages/template/modals/create-template-modal/create-template-modal.module'

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    CreateTemplateModalPageModule
  ],
  exports: [CreateThumbnailComponent],
  declarations: [CreateThumbnailComponent],
})
export class CreateThumbnailModule { }
