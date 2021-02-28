import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { UpsertTemplateModalPage } from './upsert-template-modal.page';
// import { TextEditorModule } from '@strive/ui/text-editor/text-editor.module';
import { QuillModule } from 'ngx-quill';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    ReactiveFormsModule,
    QuillModule
  ],
  declarations: [UpsertTemplateModalPage]
})
export class UpsertTemplateModalPageModule { }
