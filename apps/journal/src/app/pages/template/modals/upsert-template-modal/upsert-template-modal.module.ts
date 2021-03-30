import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { UpsertTemplateModalPage } from './upsert-template-modal.page';
// import { TextEditorModule } from '@strive/ui/text-editor/text-editor.module';
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
  declarations: [UpsertTemplateModalPage]
})
export class UpsertTemplateModalPageModule { }
