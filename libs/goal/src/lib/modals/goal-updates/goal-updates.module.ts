import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { GoalUpdatesModalComponent } from './goal-updates.component'

import { ImageDirective } from '@strive/media/directives/image.directive'
import { GoalThumbnailModule } from '../../components/thumbnail/thumbnail.module'
import { HeaderModalComponent } from '@strive/ui/header-modal/header-modal.component'
import { IonContent, IonIcon } from '@ionic/angular/standalone'

@NgModule({
  imports: [
    CommonModule,
    ImageDirective,
    GoalThumbnailModule,
    HeaderModalComponent,
    IonContent,
    IonIcon
  ],
  declarations: [GoalUpdatesModalComponent],
})
export class GoalUpdatesModalModule { }
