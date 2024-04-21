import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { RouterModule, Routes } from '@angular/router'

import { IonicModule } from '@ionic/angular'

import { UserPage } from './user.page'
import { PageLoadingComponent } from '@strive/ui/page-loading/page-loading.component'
import { ImageSelectorComponent } from '@strive/media/components/image-selector/image-selector.component'
import { SmallThumbnailComponent } from '@strive/ui/thumbnail/components/small/small-thumbnail.component'
import { DearFutureSelfPipeModule } from '@strive/exercises/dear-future-self/pipes/dear-future-self.pipe'
import { TimeToGoPipe } from '@strive/utils/pipes/time-to-go.pipe'
import { ImageModule } from '@strive/media/directives/image.module'
import { ProgressLabelPipe } from '@strive/goal/pipes/progress.pipe'

const routes: Routes = [
  {
    path: '',
    component: UserPage
  },
]

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    PageLoadingComponent,
    ImageSelectorComponent,
    SmallThumbnailComponent,
    DearFutureSelfPipeModule,
    TimeToGoPipe,
    ImageModule,
    ProgressLabelPipe
  ],
  declarations: [UserPage]
})
export class UserPageModule {}
