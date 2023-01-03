import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { RouterModule } from '@angular/router'
import { IonicModule } from '@ionic/angular'

import { GoalThumbnailComponent } from './thumbnail.component'

import { ImageModule } from '@strive/media/directives/image.module'
import { GoalOptionsModule } from '../goal-options/goal-options.module'
import { ProgressPipeModule } from '../../pipes/progress.pipe'

@NgModule({
	imports: [
		CommonModule,
		RouterModule,
		IonicModule,
		ImageModule,
		GoalOptionsModule,
		ProgressPipeModule
	],
	declarations: [GoalThumbnailComponent],
	exports: [GoalThumbnailComponent]
})
export class GoalThumbnailModule {}