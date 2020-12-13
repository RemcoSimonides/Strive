import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
// Ionic
import { IonicModule } from '@ionic/angular';
// Custom Directives
import { FileDropDirective } from '../directives/file-drop/file-drop.directive'; // Should be imporated before ImageUploadComponent!
// Share buttons
// import { ShareButtonsModule } from '@ngx-share/buttons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
// Text editor
import { QuillModule } from 'ngx-quill';
// Custom Components
import { CountdownComponent } from './countdown/countdown.component';
import { ImageUploadComponent } from './image-upload/image-upload.component';
import { TextEditorComponent } from './text-editor/text-editor.component';
import { CommentComponent } from './comment/comment.component';

// import { ChatModalModule } from '@strive/chat/components/chat-modal/chat-modal.module'

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule.forRoot(),
    RouterModule,
    // ChatModalModule,
    // ShareButtonsModule,
    QuillModule,
    FontAwesomeModule
  ],
  declarations: [
    CountdownComponent,
    FileDropDirective,
    ImageUploadComponent,
    TextEditorComponent,
    CommentComponent,
  ],
  exports: [
    CountdownComponent,
    FileDropDirective,
    ImageUploadComponent,
    TextEditorComponent,
    CommentComponent,
  ]
})
export class ComponentsModule { }
