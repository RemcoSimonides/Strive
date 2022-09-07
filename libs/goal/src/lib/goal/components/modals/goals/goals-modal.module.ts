import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { IonicModule } from '@ionic/angular'

import { GoalsModalComponent } from './goals-modal.component'

import { ImageModule } from '@strive/media/directives/image.module'
import { GoalThumbnailModule } from '../../thumbnail/thumbnail.module'
import { OptionsPopoverModule } from '../../popovers/options/options.module'

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    ImageModule,
    GoalThumbnailModule,
    OptionsPopoverModule
  ],
  declarations: [GoalsModalComponent],
})
export class GoalsModalModule { }
