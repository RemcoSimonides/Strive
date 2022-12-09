import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { IonicModule } from '@ionic/angular'

import { SupportDetailsComponent } from './details.component'

import { PledgeModule } from '../../components/pledge/pledge.module'
import { SupportDecisionModule } from '../../components/decision/decision.module'
import { PostComponentModule } from '@strive/post/components/post/post.module'

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    PledgeModule,
    SupportDecisionModule,
    PostComponentModule
  ],
  declarations: [SupportDetailsComponent],
  exports: [SupportDetailsComponent]
})
export class SupportDetailsModule {}