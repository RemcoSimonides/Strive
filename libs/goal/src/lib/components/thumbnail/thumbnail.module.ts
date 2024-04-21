import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { RouterModule } from '@angular/router'
import { GoalThumbnailComponent } from './thumbnail.component'

import { ImageDirective } from '@strive/media/directives/image.directive'
import { GoalOptionsModule } from '../goal-options/goal-options.module'
import { ProgressPipe } from '../../pipes/progress.pipe'
import { IonCard, IonThumbnail, IonIcon, IonProgressBar, IonButton } from '@ionic/angular/standalone'

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    ImageDirective,
    GoalOptionsModule,
    ProgressPipe,
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
