// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
// Component
import { ThumbnailListComponent } from './thumbnail-list.component';
import { CreateThumbnailModule } from './components/create-thumbnail/create.module';
import { IonicModule } from '@ionic/angular';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    FlexLayoutModule,
    CreateThumbnailModule
  ],
  exports: [ThumbnailListComponent],
  declarations: [ThumbnailListComponent]
})
export class ThumbnailListModule { }
