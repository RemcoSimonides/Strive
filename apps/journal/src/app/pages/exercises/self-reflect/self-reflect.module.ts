import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import { RouterModule, Routes } from '@angular/router'
import { SelfReflectComponent } from './self-reflect.component'

import { HeaderModule } from '@strive/ui/header/header.module'
import { SelfReflectEntryModule } from '@strive/exercises/self-reflect/components/entry/self-reflect-entry.module'
import { SelfReflectSettingsComponent } from './settings/self-reflect-settings.component'
import { SelfReflectFrequencyPipe, SelfReflectReplaceFrequencyPipe } from '@strive/exercises/self-reflect/pipes/frequency.pipe'
import { SelfReflectFilterEntriesPipe } from '@strive/exercises/self-reflect/pipes/entry.pipe'
import { PageLoadingModule } from '@strive/ui/page-loading/page-loading.module'
import { SelfReflectCustomQuestionModalComponent } from '@strive/exercises/self-reflect/modals/create-custom-question/create-custom-question.component'
import { IonButtons, IonButton, IonIcon, IonContent, IonList, IonItem, IonLabel, IonPopover, IonSelect, IonSelectOption } from '@ionic/angular/standalone'

const routes: Routes = [
  {
    path: '',
    component: SelfReflectComponent
  },
  {
    path: 'settings',
    component: SelfReflectSettingsComponent
  }
]

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    HeaderModule,
    SelfReflectEntryModule,
    SelfReflectFrequencyPipe,
    PageLoadingModule,
    SelfReflectReplaceFrequencyPipe,
    SelfReflectCustomQuestionModalComponent,
    SelfReflectFilterEntriesPipe,
    IonButtons,
    IonButton,
    IonIcon,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonPopover,
    IonSelect,
    IonSelectOption
  ],
  declarations: [SelfReflectComponent]
})
export class SelfReflectModule { }
