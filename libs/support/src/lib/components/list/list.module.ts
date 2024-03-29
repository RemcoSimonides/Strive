import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { RouterModule } from '@angular/router'
import { IonicModule } from '@ionic/angular'

import { SupportListComponent } from './list.component'

import { PledgeModule } from '../pledge/pledge.module'
import { SupportDecisionModule } from '../decision/decision.module'
import { SupportDetailsModalModule } from '../../modals/details/details.module'
import { SupportCounterPipeModule } from '../../pipes/count.pipe'
import { SupportRolePipeModule } from '../../pipes/role.pipe'

import { MilestonePathPipeModule } from '@strive/roadmap/pipes/path.pipe'

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    IonicModule,
    PledgeModule,
    MilestonePathPipeModule,
    SupportDecisionModule,
    SupportDetailsModalModule,
    SupportCounterPipeModule,
    SupportRolePipeModule
  ],
  declarations: [
    SupportListComponent
  ],
  exports: [
    SupportListComponent
  ]
})
export class SupportListModule {}