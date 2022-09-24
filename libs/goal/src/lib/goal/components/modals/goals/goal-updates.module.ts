import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { IonicModule } from '@ionic/angular'

import { GoalUpdatesModalComponent } from './goal-updates.component'

import { ImageModule } from '@strive/media/directives/image.module'
import { GoalThumbnailModule } from '../../thumbnail/thumbnail.module'

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    ImageModule,
    GoalThumbnailModule
  ],
  declarations: [GoalUpdatesModalComponent],
})
export class GoalUpdatesModalModule { }
