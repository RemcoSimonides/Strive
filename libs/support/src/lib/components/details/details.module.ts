import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { RouterModule } from '@angular/router'
import { ReactiveFormsModule } from '@angular/forms'
import { IonicModule } from '@ionic/angular'

import { SupportDetailsComponent } from './details.component'

import { PledgeModule } from '../../components/pledge/pledge.module'
import { SupportDecisionModule } from '../../components/decision/decision.module'
import { SupportRolePipeModule } from '../../pipes/role.pipe'

import { PostComponentModule } from '@strive/post/components/post/post.module'

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    PledgeModule,
    RouterModule,
    ReactiveFormsModule,
    SupportDecisionModule,
    PostComponentModule,
    SupportRolePipeModule
  ],
  declarations: [SupportDetailsComponent],
  exports: [SupportDetailsComponent]
})
export class SupportDetailsModule {}