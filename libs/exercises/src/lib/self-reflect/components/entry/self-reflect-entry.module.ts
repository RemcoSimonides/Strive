import { CommonModule } from '@angular/common'
import { ReactiveFormsModule } from '@angular/forms'
import { NgModule } from '@angular/core'

import { SelfReflectEntryComponent } from './self-reflect-entry.component'
import { IonicModule } from '@ionic/angular'

import { PageLoadingModule } from '@strive/ui/page-loading/page-loading.module'

import { SelfReflectQuestionActivatedPipe } from '../../pipes/activated.pipe'

import { SelfReflectIntroComponent } from '../intro/intro.component'
import { PreviousIntentionComponent } from '../previous-intention/previous-intention.component'
import { WheelOfLifeComponent } from '../wheel-of-life/wheel-of-life.component'
import { PrioritizeGoalsComponent } from '../prioritize-goals/prioritize-goals.component'
import { SelfReflectOutroComponent } from '../outro/outro.component'
import { SelfReflectFormListComponent } from '../form-list/form-list.component'
import { SelfReflectTextareaComponent } from '../textarea/textarea.component'
import { SelfReflectStepFilterPipe } from '../../pipes/step.pipe'

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    ReactiveFormsModule,

    PageLoadingModule,
    SelfReflectQuestionActivatedPipe,

    SelfReflectIntroComponent,
    PreviousIntentionComponent,
    WheelOfLifeComponent,
    SelfReflectOutroComponent,
    PrioritizeGoalsComponent,
    SelfReflectFormListComponent,
    SelfReflectTextareaComponent,
    SelfReflectStepFilterPipe
  ],
  declarations: [SelfReflectEntryComponent],
  exports: [SelfReflectEntryComponent]
})
export class SelfReflectEntryModule {}