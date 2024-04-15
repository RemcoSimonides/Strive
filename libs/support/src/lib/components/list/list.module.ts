import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { RouterModule } from '@angular/router'
import { SupportListComponent } from './list.component'

import { PledgeModule } from '../pledge/pledge.module'
import { SupportDecisionModule } from '../decision/decision.module'
import { SupportDetailsModalModule } from '../../modals/details/details.module'
import { SupportCounterPipeModule } from '../../pipes/count.pipe'
import { SupportRolePipeModule } from '../../pipes/role.pipe'

import { MilestonePathPipeModule } from '@strive/roadmap/pipes/path.pipe'
import { IonList, IonItem, IonLabel, IonButton, IonIcon } from '@ionic/angular/standalone'

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    PledgeModule,
    MilestonePathPipeModule,
    SupportDecisionModule,
    SupportDetailsModalModule,
    SupportCounterPipeModule,
    SupportRolePipeModule,
    IonList,
    IonItem,
    IonLabel,
    IonButton,
    IonIcon
  ],
  declarations: [
    SupportListComponent
  ],
  exports: [
    SupportListComponent
  ]
})
export class SupportListModule { }
