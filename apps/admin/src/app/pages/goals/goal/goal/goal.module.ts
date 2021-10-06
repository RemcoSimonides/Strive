import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { GoalComponent } from './goal.component';
import { PageLoadingModule } from '@strive/ui/page-loading/page-loading.module';
import { ImageSelectorModule } from '@strive/media/components/image-selector/image-selector.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    PageLoadingModule,
    ImageSelectorModule
  ],
  declarations: [GoalComponent],
  exports: [GoalComponent]
})
export class GoalPageModule {}
