import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ReactiveFormsModule } from '@angular/forms'
import { Routes, RouterModule } from '@angular/router'

import { IonicModule } from '@ionic/angular'

import { ExploreComponent } from './explore.page'

// Strive
import { ThumbnailListModule } from '@strive/ui/thumbnail/layout/list/thumbnail-list.module'
import { SmallThumbnailModule } from '@strive/ui/thumbnail/components/small/small-thumbnail.module'
import { LargeThumbnailModule } from '@strive/ui/thumbnail/components/large/large-thumbnail.module'
import { RowsPipeModule } from '@strive/ui/thumbnail/pipes/rows.pipe'
import { ImageModule } from '@strive/media/directives/image.module'
import { HeaderRootModule } from '@strive/ui/header-root/header-root.module'

import { FooterModule } from '@strive/ui/footer/footer.module'

const routes: Routes = [
  {
    path: '',
    component: ExploreComponent
  }
]

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    
    // Strive
    ThumbnailListModule,
    SmallThumbnailModule,
    LargeThumbnailModule,
    RowsPipeModule,
    ImageModule,
    HeaderRootModule,
    FooterModule
  ],
  declarations: [
    ExploreComponent
  ]
})
export class ExplorePageModule {}
