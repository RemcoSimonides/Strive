import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { RouterModule } from '@angular/router'
import { GoalThumbnailComponent } from './thumbnail.component'

import { ImageDirective } from '@strive/media/directives/image.directive'
import { GoalOptionsComponent } from '../goal-options/goal-options.component'
import { ProgressPipe } from '../../pipes/progress.pipe'
import { IonCard, IonThumbnail, IonIcon, IonProgressBar, IonButton } from '@ionic/angular/standalone'

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    ImageDirective,
    GoalOptionsComponent,
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
