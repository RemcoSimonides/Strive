import { CommonModule } from '@angular/common'
import { ReactiveFormsModule } from '@angular/forms'
import { NgModule } from '@angular/core'

import { AssessLifeEntryComponent } from './assess-life-entry.component'
import { IonicModule } from '@ionic/angular'

import { PageLoadingModule } from '@strive/ui/page-loading/page-loading.module'

import { AssessLifeQuestionActivatedPipe } from '../../pipes/activated.pipe'

import { AssessLifeIntroComponent } from '../intro/intro.component'
import { PreviousIntentionComponent } from '../previous-intention/previous-intention.component'
import { AssessLifeTimeManagementPastComponent } from '../time-management/past/time-management-past.component'
import { AssessLifeTimeManagementFutureComponent } from '../time-management/future/time-management-future.component'
import { WheelOfLifeComponent } from '../wheel-of-life/wheel-of-life.component'
import { PrioritizeGoalsComponent } from '../prioritize-goals/prioritize-goals.component'
import { AssessLifeOutroComponent } from '../outro/outro.component'
import { AssessLifeProudComponent } from '../proud/proud.component'
import { AssessLifeLearnFutureComponent } from '../learn/future/learn-future.component'
import { AssessLifeLearnPastComponent } from '../learn/past/learn-past.component'
import { AssessLifeGratitudeComponent } from '../gratitude/gratitude.component'
import { AssessLifeDearFutureSelfComponent } from '../dear-future-self/dear-future-self.component'
import { AssessLifeExploreFutureComponent } from '../explore/future/explore-future.component'
import { AssessLifeExplorePastComponent } from '../explore/past/explore-past.component'

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    ReactiveFormsModule,

    PageLoadingModule,
    AssessLifeQuestionActivatedPipe,

    AssessLifeIntroComponent,
    PreviousIntentionComponent,
    AssessLifeTimeManagementPastComponent,
    WheelOfLifeComponent,
    AssessLifeTimeManagementFutureComponent,
    AssessLifeOutroComponent,
    PrioritizeGoalsComponent,
    AssessLifeProudComponent,
    AssessLifeLearnFutureComponent,
    AssessLifeLearnPastComponent,
    AssessLifeGratitudeComponent,
    AssessLifeDearFutureSelfComponent,
    AssessLifeExploreFutureComponent,
    AssessLifeExplorePastComponent
  ],
  declarations: [AssessLifeEntryComponent],
  exports: [AssessLifeEntryComponent]
})
export class AssessLifeEntryModule {}