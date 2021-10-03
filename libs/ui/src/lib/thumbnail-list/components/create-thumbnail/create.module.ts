import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { FlexLayoutModule } from '@angular/flex-layout';

import { CreateThumbnailComponent } from './create.component';
import { UpsertTemplateModalPageModule } from '@strive/template/modals/upsert/upsert-template-modal.module';
import { UpsertGoalModalModule } from '@strive/goal/goal/components/upsert/upsert.module';
import { UpsertCollectiveGoalModule } from '@strive/collective-goal/collective-goal/modals/upsert/upsert.module';
import { ImageModule } from '@strive/media/directives/image.module';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    FlexLayoutModule,
    UpsertTemplateModalPageModule,
    UpsertGoalModalModule,
    UpsertCollectiveGoalModule,
    ImageModule
  ],
  exports: [CreateThumbnailComponent],
  declarations: [CreateThumbnailComponent],
})
export class CreateThumbnailModule { }
