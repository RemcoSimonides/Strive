import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ReactiveFormsModule } from '@angular/forms'
import { Routes, RouterModule } from '@angular/router'
import { ExplorePageComponent } from './explore.page'

// Strive
import { ThumbnailListModule } from '@strive/ui/thumbnail/layout/list/thumbnail-list.module'
import { SmallThumbnailModule } from '@strive/ui/thumbnail/components/small/small-thumbnail.module'
import { LargeThumbnailModule } from '@strive/ui/thumbnail/components/large/large-thumbnail.module'
import { RowsPipeModule } from '@strive/ui/thumbnail/pipes/rows.pipe'
import { ImageModule } from '@strive/media/directives/image.module'
import { HeaderComponent } from '@strive/ui/header/header.component'

import { FooterComponent } from '@strive/ui/footer/footer.component'
import { IonContent, IonSearchbar, IonCard, IonSelect, IonSelectOption, IonButton } from '@ionic/angular/standalone'

const routes: Routes = [
  {
    path: '',
    component: ExplorePageComponent
  }
]

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),

    // Strive
    ThumbnailListModule,
    SmallThumbnailModule,
    LargeThumbnailModule,
    RowsPipeModule,
    ImageModule,
    HeaderComponent,
    FooterComponent,
    IonContent,
    IonSearchbar,
    IonCard,
    IonSelect,
    IonSelectOption,
    IonButton
  ],
  declarations: [
    ExplorePageComponent
  ]
})
export class ExplorePageModule { }
