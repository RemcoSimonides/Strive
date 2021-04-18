import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { UpsertPostModal } from './upsert-modal.component';

import { ImageSelectorModule } from '@strive/media/components/image-selector/image-selector.module';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule,
    ImageSelectorModule
  ],
  declarations: [UpsertPostModal]
})
export class UpsertPostModalModule {}
