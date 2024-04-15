import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { GoalUpdatesModalComponent } from './goal-updates.component'

import { ImageModule } from '@strive/media/directives/image.module'
import { GoalThumbnailModule } from '../../components/thumbnail/thumbnail.module'
import { HeaderModalComponent } from '@strive/ui/header-modal/header-modal.component'
import { IonContent, IonIcon } from '@ionic/angular/standalone'

@NgModule({
  imports: [
    CommonModule,
    ImageModule,
    GoalThumbnailModule,
    HeaderModalComponent,
    IonContent,
    IonIcon
  ],
  declarations: [GoalUpdatesModalComponent],
})
export class GoalUpdatesModalModule { }
