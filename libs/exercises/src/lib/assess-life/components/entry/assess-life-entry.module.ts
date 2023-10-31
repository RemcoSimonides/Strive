import { CommonModule } from '@angular/common'
import { ReactiveFormsModule } from '@angular/forms'
import { NgModule } from '@angular/core'

import { AssessLifeEntryComponent } from './assess-life-entry.component'
import { IonicModule } from '@ionic/angular'

import { PageLoadingModule } from '@strive/ui/page-loading/page-loading.module'

import { AssessLifeQuestionActivatedPipe } from '../../pipes/activated.pipe'

import { AssessLifeIntroComponent } from '../intro/intro.component'
import { PreviousIntentionComponent } from '../previous-intention/previous-intention.component'
import { WheelOfLifeComponent } from '../wheel-of-life/wheel-of-life.component'
import { PrioritizeGoalsComponent } from '../prioritize-goals/prioritize-goals.component'
import { AssessLifeOutroComponent } from '../outro/outro.component'
import { AssessLifeFormListComponent } from '../form-list/form-list.component'
import { AssessLifeTextareaComponent } from '../textarea/textarea.component'
import { AssessLifeStepFilterPipe } from '../../pipes/step.pipe'

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    ReactiveFormsModule,

    PageLoadingModule,
    AssessLifeQuestionActivatedPipe,

    AssessLifeIntroComponent,
    PreviousIntentionComponent,
    WheelOfLifeComponent,
    AssessLifeOutroComponent,
    PrioritizeGoalsComponent,
    AssessLifeFormListComponent,
    AssessLifeTextareaComponent,
    AssessLifeStepFilterPipe
  ],
  declarations: [AssessLifeEntryComponent],
  exports: [AssessLifeEntryComponent]
})
export class AssessLifeEntryModule {}