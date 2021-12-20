import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';

import { IonicModule } from '@ionic/angular';

import { UpsertGoalModalComponent } from './upsert.component';
import { Slide1 } from './slides/slide-1/slide-1.component';
import { Slide2 } from './slides/slide-2/slide-2.component';
import { Slide3 } from './slides/slide-3/slide-3.component';
import { Slide4 } from './slides/slide-4/slide-4.component';
import { Slide5 } from './slides/slide-5/slide-5.component';
import { SlideUpdate } from './slides/slide-update/slide-update.component';

import { SwiperModule } from 'swiper/angular';
import { AutosizeModule } from '@strive/ui/directives/auto-resize-textarea.directive';
import { ImageSelectorModule } from '@strive/media/components/image-selector/image-selector.module';
import { EditRoadmapModule } from '@strive/milestone/components/edit-roadmap/edit-roadmap.module';
import { SmallThumbnailModule } from '@strive/ui/thumbnail/components/small/small-thumbnail.module';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule,
    FlexLayoutModule,
    AutosizeModule,
    ImageSelectorModule,
    SwiperModule,
    EditRoadmapModule,
    SmallThumbnailModule
  ],
  declarations: [
    UpsertGoalModalComponent,
    Slide1,
    Slide2,
    Slide3,
    Slide4,
    Slide5,
    SlideUpdate
  ]
})
export class UpsertGoalModalModule {}
