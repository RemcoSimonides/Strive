import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { StoryComponent } from './story.component';
import { PageLoadingModule } from '@strive/ui/page-loading/page-loading.module';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    RouterModule,
    PageLoadingModule
  ],
  declarations: [StoryComponent],
  exports: [StoryComponent]
})
export class StoryModule {}
