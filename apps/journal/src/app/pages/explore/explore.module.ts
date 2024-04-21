import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ReactiveFormsModule } from '@angular/forms'
import { Routes, RouterModule } from '@angular/router'
import { ExplorePageComponent } from './explore.page'

// Strive
import { ThumbnailListComponent } from '@strive/ui/thumbnail/layout/list/thumbnail-list.component'
import { SmallThumbnailComponent } from '@strive/ui/thumbnail/components/small/small-thumbnail.component'
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
    ThumbnailListComponent,
    SmallThumbnailComponent,
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
