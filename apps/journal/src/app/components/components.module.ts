import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { RouterModule } from '@angular/router'
// Ionic
import { IonicModule } from '@ionic/angular'
// Custom Directives
// import { FileDropDirective } from '../directives/file-drop/file-drop.directive' // Should be imporated before ImageUploadComponent!
// Share buttons
// import { ShareButtonsModule } from '@ngx-share/buttons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'
// Pages
// import { NotificationOptionsPage } from './notification/popovers/notification-options/notification-options.page'
// Text editor
import { QuillModule } from 'ngx-quill'
// Custom Components
import { GoalThumbnailComponent } from './goal-thumbnail/goal-thumbnail.component'
import { GoalThumbnailBrowserComponent } from './goal-thumbnail-browser/goal-thumbnail-browser.component'
// import { CreateGoalThumbnailComponent } from './create-goal-thumbnail/create-goal-thumbnail.component'
// import { HeaderComponent } from './header/header.component'
// import { PostComponent } from './post/post.component'
// import { CountdownComponent } from './countdown/countdown.component'
// import { ImageUploadComponent } from './image-upload/image-upload.component'
// import { ShareComponent } from './share/share.component'
// import { TextEditorComponent } from './text-editor/text-editor.component'
// import { NotificationComponent } from './notification/notification.component'
// import { CommentComponent } from './comment/comment.component'

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule.forRoot(),
    RouterModule,
    // ShareButtonsModule,
    QuillModule,
    FontAwesomeModule
  ],
  declarations: [
    GoalThumbnailComponent,
    GoalThumbnailBrowserComponent,
    // CreateGoalThumbnailComponent,
    // HeaderComponent,
    // PostComponent,
    // CountdownComponent,
    // FileDropDirective,
    // ImageUploadComponent,
    // ShareComponent,
    // TextEditorComponent,
    // NotificationComponent,
    // CommentComponent,
    // NotificationOptionsPage
  ],
  entryComponents: [
    // NotificationOptionsPage
  ],
  exports: [
    // CountdownComponent,
    GoalThumbnailComponent,
    GoalThumbnailBrowserComponent,
    // CreateGoalThumbnailComponent,
    // HeaderComponent,
    // PostComponent,
    // FileDropDirective,
    // ImageUploadComponent,
    // ShareComponent,
    // TextEditorComponent,
    // NotificationComponent,
    // CommentComponent,
  ]
})
export class ComponentsModule { }
