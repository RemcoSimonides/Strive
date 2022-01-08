import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { UpsertTemplateModalComponent } from './upsert-template-modal.page';
import { QuillModule } from 'ngx-quill';
import { ImageSelectorModule } from '@strive/media/components/image-selector/image-selector.module';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    ReactiveFormsModule,
    QuillModule,
    ImageSelectorModule
  ],
  declarations: [UpsertTemplateModalComponent]
})
export class UpsertTemplateModalPageModule { }
