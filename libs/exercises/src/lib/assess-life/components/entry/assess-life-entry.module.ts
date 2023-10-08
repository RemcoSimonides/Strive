import { CommonModule } from '@angular/common'
import { ReactiveFormsModule } from '@angular/forms'
import { NgModule } from '@angular/core'

import { AssessLifeEntryComponent } from './assess-life-entry.component'
import { IonicModule } from '@ionic/angular'

import { PageLoadingModule } from '@strive/ui/page-loading/page-loading.module'

import { AssessLifeIntroComponent } from '../intro/intro.component'
import { PreviousIntentionComponent } from '../previous-intention/previous-intention.component'
import { AssessLifeTimeManagementPastComponent } from '../time-management/past/time-management-past.component'
import { AssessLifeTimeManagementFutureComponent } from '../time-management/future/time-management-future.component'
import { WheelOfLifeComponent } from '../wheel-of-life/wheel-of-life.component'
import { PrioritizeGoalsComponent } from '../prioritize-goals/prioritize-goals.component'
import { AssessLifeOutroComponent } from '../outro/outro.component'
import { AssessLifeStressComponent } from '../stress/stress.component'

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    ReactiveFormsModule,

    PageLoadingModule,

    AssessLifeIntroComponent,
    PreviousIntentionComponent,
    AssessLifeTimeManagementPastComponent,
    WheelOfLifeComponent,
    AssessLifeTimeManagementFutureComponent,
    AssessLifeOutroComponent,
    PrioritizeGoalsComponent,
    AssessLifeStressComponent
  ],
  declarations: [AssessLifeEntryComponent],
  exports: [AssessLifeEntryComponent]
})
export class AssessLifeEntryModule {}