// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
// Component
import { ThumbnailListComponent } from './thumbnail-list.component';
import { CreateThumbnailComponent } from './components/create-thumbnail/create.component';
import { IonicModule } from '@ionic/angular';
// Font Awesome
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    FontAwesomeModule
  ],
  exports: [
    ThumbnailListComponent,
    CreateThumbnailComponent
  ],
  declarations: [
    ThumbnailListComponent,
    CreateThumbnailComponent
  ]
})
export class ThumbnailListModule { }
