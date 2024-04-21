import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ReactiveFormsModule } from '@angular/forms'
import { RouterModule, Routes } from '@angular/router'
import { WheelOfLifePageComponent } from './wheel-of-life.component'

import { PageLoadingComponent } from '@strive/ui/page-loading/page-loading.component'
import { AuthModalModule } from '@strive/auth/components/auth-modal/auth-modal.module'
import { HeaderComponent } from '@strive/ui/header/header.component'

import { WheelOfLifeEntryComponent } from '@strive/exercises/wheel-of-life/components/entry/entry.component'
import { EntryModalModule } from '@strive/exercises/wheel-of-life/modals/entry/entry.module'
import { WheelOfLifeResultsModule } from '@strive/exercises/wheel-of-life/components/results/results.module'
import { GoalCreateModalComponent } from '@strive/goal/modals/upsert/create/create.component'

import { EntryPipeModule } from '@strive/exercises/wheel-of-life/pipes/entry.pipe'
import { IonContent, IonSelect, IonSelectOption, IonButton, IonIcon, IonCard, IonCardContent } from '@ionic/angular/standalone'

const routes: Routes = [
  {
    path: '',
    component: WheelOfLifePageComponent
  }
]

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    PageLoadingComponent,
    AuthModalModule,
    HeaderComponent,
    WheelOfLifeEntryComponent,
    EntryModalModule,
    WheelOfLifeResultsModule,
    EntryPipeModule,
    GoalCreateModalComponent,
    IonContent,
    IonSelect,
    IonSelectOption,
    IonButton,
    IonIcon,
    IonCard,
    IonCardContent
  ],
  declarations: [WheelOfLifePageComponent]
})
export class WheelOfLifeModule { }
