import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { IonicModule } from '@ionic/angular'

import { EntryModalComponent } from './entry.component'

import { HeaderModule } from '@strive/ui/header/header.module'
import { WheelOfLifeEntryModule } from '../../components/entry/entry.module'
import { EntryPipeModule } from '@strive/exercises/wheel-of-life/pipes/entry.pipe'
import { WheelOfLifeResultsModule } from '../../components/results/results.module'
import { GoalCreateModalComponent } from '@strive/goal/modals/upsert/create/create.component'

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    HeaderModule,
    WheelOfLifeEntryModule,
    EntryPipeModule,
    WheelOfLifeResultsModule,
    GoalCreateModalComponent
  ],
  declarations: [EntryModalComponent]
})
export class EntryModalModule {}