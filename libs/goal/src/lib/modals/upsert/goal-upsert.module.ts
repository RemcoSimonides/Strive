import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ReactiveFormsModule } from '@angular/forms'
import { RouterModule } from '@angular/router'

import { IonicModule } from '@ionic/angular'

import { UpsertGoalModalComponent } from './goal-upsert.component'
import { Slide1Component } from './slides/slide-1/slide-1.component'
import { Slide2Component } from './slides/slide-2/slide-2.component'
import { Slide3Component } from './slides/slide-3/slide-3.component'
import { Slide4Component } from './slides/slide-4/slide-4.component'
import { Slide5Component } from './slides/slide-5/slide-5.component'
import { SlideUpdateComponent } from './slides/slide-update/slide-update.component'

import { SwiperModule } from 'swiper/angular'
import { ImageSelectorModule } from '@strive/media/components/image-selector/image-selector.module'
import { RoadmapModule } from '@strive/roadmap/components/roadmap/roadmap.module'
import { SmallThumbnailModule } from '@strive/ui/thumbnail/components/small/small-thumbnail.module'
import { SuggestionSComponent } from '@strive/ui/suggestion/suggestion.component'
import { DatetimeModule } from '@strive/ui/datetime/datetime.module'
import { IsFuturePipe } from '@strive/utils/pipes/date-fns.pipe'


@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    IonicModule,
    ImageSelectorModule,
    SwiperModule,
    RoadmapModule,
    SmallThumbnailModule,
    DatetimeModule,
    SuggestionSComponent,
    IsFuturePipe
  ],
  declarations: [
    UpsertGoalModalComponent,
    Slide1Component,
    Slide2Component,
    Slide3Component,
    Slide4Component,
    Slide5Component,
    SlideUpdateComponent
  ]
})
export class UpsertGoalModalModule {}