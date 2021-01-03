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
// Custom Components
import { ImageUploadComponent } from './image-upload/image-upload.component';

// import { ChatModalModule } from '@strive/chat/components/chat-modal/chat-modal.module'

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule.forRoot(),
    RouterModule,
    // ChatModalModule,
    // ShareButtonsModule,
    FontAwesomeModule
  ],
  declarations: [
    FileDropDirective,
    ImageUploadComponent
  ],
  exports: [
    FileDropDirective,
    ImageUploadComponent
  ]
})
export class ComponentsModule { }
