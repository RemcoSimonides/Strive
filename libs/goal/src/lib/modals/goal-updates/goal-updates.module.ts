import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { IonicModule } from '@ionic/angular'

import { GoalUpdatesModalComponent } from './goal-updates.component'

import { ImageModule } from '@strive/media/directives/image.module'
import { GoalThumbnailModule } from '../../components/thumbnail/thumbnail.module'
import { HeaderModalComponent } from '@strive/ui/header-modal/header-modal.component'

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    ImageModule,
    GoalThumbnailModule,
    HeaderModalComponent
  ],
  declarations: [GoalUpdatesModalComponent],
})
export class GoalUpdatesModalModule { }
