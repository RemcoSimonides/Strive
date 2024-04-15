import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { EntryModalComponent } from './entry.component'

import { HeaderModalComponent } from '@strive/ui/header-modal/header-modal.component'
import { WheelOfLifeEntryModule } from '../../components/entry/entry.module'
import { EntryPipeModule } from '@strive/exercises/wheel-of-life/pipes/entry.pipe'
import { WheelOfLifeResultsModule } from '../../components/results/results.module'
import { GoalCreateModalComponent } from '@strive/goal/modals/upsert/create/create.component'
import { IonContent } from '@ionic/angular/standalone'

@NgModule({
  imports: [
    CommonModule,
    HeaderModalComponent,
    WheelOfLifeEntryModule,
    EntryPipeModule,
    WheelOfLifeResultsModule,
    GoalCreateModalComponent,
    IonContent
  ],
  declarations: [EntryModalComponent]
})
export class EntryModalModule { }
