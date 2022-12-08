import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { RouterModule } from '@angular/router'
import { IonicModule } from '@ionic/angular'

import { SupportListComponent } from './list.component'

import { PledgeModule } from '@strive/support/components/pledge/pledge.module'
import { MilestonePathPipeModule } from '@strive/goal/milestone/pipes/path.pipe'

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    IonicModule,
    PledgeModule,
    MilestonePathPipeModule
  ],
  declarations: [
    SupportListComponent
  ],
  exports: [
    SupportListComponent
  ]
})
export class SupportListModule {}