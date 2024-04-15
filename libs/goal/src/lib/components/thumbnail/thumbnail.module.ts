import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { RouterModule } from '@angular/router'
import { GoalThumbnailComponent } from './thumbnail.component'

import { ImageModule } from '@strive/media/directives/image.module'
import { GoalOptionsModule } from '../goal-options/goal-options.module'
import { ProgressPipeModule } from '../../pipes/progress.pipe'
import { IonCard, IonThumbnail, IonIcon, IonProgressBar, IonButton } from '@ionic/angular/standalone'

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    ImageModule,
    GoalOptionsModule,
    ProgressPipeModule,
    IonCard,
    IonThumbnail,
    IonIcon,
    IonProgressBar,
    IonButton
  ],
  declarations: [GoalThumbnailComponent],
  exports: [GoalThumbnailComponent]
})
export class GoalThumbnailModule { }
