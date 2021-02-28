import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';

import { CreateThumbnailComponent } from './create.component';
import { UpsertTemplateModalPageModule } from 'apps/journal/src/app/pages/template/modals/upsert-template-modal/upsert-template-modal.module'

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    UpsertTemplateModalPageModule
  ],
  exports: [CreateThumbnailComponent],
  declarations: [CreateThumbnailComponent],
})
export class CreateThumbnailModule { }
