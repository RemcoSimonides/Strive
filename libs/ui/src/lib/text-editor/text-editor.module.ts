import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { QuillModule } from 'ngx-quill';

import { TextEditorComponent } from './text-editor.component';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    QuillModule.forRoot(),
  ],
  exports: [TextEditorComponent],
  declarations: [TextEditorComponent]
})
export class TextEditorModule { }
