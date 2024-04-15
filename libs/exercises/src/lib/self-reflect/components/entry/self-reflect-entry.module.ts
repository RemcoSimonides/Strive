import { CommonModule } from '@angular/common'
import { ReactiveFormsModule } from '@angular/forms'
import { NgModule } from '@angular/core'

import { SelfReflectEntryComponent } from './self-reflect-entry.component'
import { PageLoadingModule } from '@strive/ui/page-loading/page-loading.module'

import { SelfReflectQuestionActivatedPipe } from '../../pipes/activated.pipe'

import { SelfReflectIntermediateComponent } from '../intermediate/intermediate.component'
import { PreviousIntentionComponent } from '../previous-intention/previous-intention.component'
import { WheelOfLifeComponent } from '../wheel-of-life/wheel-of-life.component'
import { PrioritizeGoalsComponent } from '../prioritize-goals/prioritize-goals.component'
import { SelfReflectOutroComponent } from '../outro/outro.component'
import { SelfReflectFormListComponent } from '../form-list/form-list.component'
import { SelfReflectTextareaComponent } from '../textarea/textarea.component'
import { SelfReflectStepFilterPipe } from '../../pipes/step.pipe'
import { IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon, IonContent, IonFooter, IonProgressBar } from '@ionic/angular/standalone'

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,

    PageLoadingModule,
    SelfReflectQuestionActivatedPipe,

    SelfReflectIntermediateComponent,
    PreviousIntentionComponent,
    WheelOfLifeComponent,
    SelfReflectOutroComponent,
    PrioritizeGoalsComponent,
    SelfReflectFormListComponent,
    SelfReflectTextareaComponent,
    SelfReflectStepFilterPipe,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonIcon,
    IonContent,
    IonFooter,
    IonProgressBar
  ],
  declarations: [SelfReflectEntryComponent],
  exports: [SelfReflectEntryComponent]
})
export class SelfReflectEntryModule { }
