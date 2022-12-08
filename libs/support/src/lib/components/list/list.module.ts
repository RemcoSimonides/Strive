import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { RouterModule } from '@angular/router'
import { IonicModule } from '@ionic/angular'

import { SupportListComponent } from './list.component'

import { PledgeModule } from '../pledge/pledge.module'
import { SupportDecisionModule } from '../decision/decision.module'
import { MilestonePathPipeModule } from '@strive/goal/milestone/pipes/path.pipe'

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    IonicModule,
    PledgeModule,
    MilestonePathPipeModule,
    SupportDecisionModule
  ],
  declarations: [
    SupportListComponent
  ],
  exports: [
    SupportListComponent
  ]
})
export class SupportListModule {}