// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
// Component
import { ThumbnailListComponent } from './thumbnail-list.component';
import { CreateThumbnailModule } from './components/create-thumbnail/create.module';
import { IonicModule } from '@ionic/angular';
// Font Awesome
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    FlexLayoutModule,
    FontAwesomeModule,
    CreateThumbnailModule
  ],
  exports: [ThumbnailListComponent],
  declarations: [ThumbnailListComponent]
})
export class ThumbnailListModule { }
