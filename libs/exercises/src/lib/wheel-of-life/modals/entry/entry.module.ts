import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'

import { IonContent } from '@ionic/angular/standalone'

import { EntryModalComponent } from './entry.component'

import { HeaderModalComponent } from '@strive/ui/header-modal/header-modal.component'
import { WheelOfLifeEntryComponent } from '../../components/entry/entry.component'
import { EntryPipeModule } from '@strive/exercises/wheel-of-life/pipes/entry.pipe'
import { WheelOfLifeResultsComponent } from '../../components/results/results.component'
import { GoalCreateModalComponent } from '@strive/goal/modals/upsert/create/create.component'

@NgModule({
  imports: [
    CommonModule,
    HeaderModalComponent,
    WheelOfLifeEntryComponent,
    EntryPipeModule,
    WheelOfLifeResultsComponent,
    GoalCreateModalComponent,
    IonContent
  ],
  declarations: [EntryModalComponent]
})
export class EntryModalModule { }
