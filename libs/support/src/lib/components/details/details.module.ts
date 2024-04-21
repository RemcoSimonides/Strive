import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { RouterModule } from '@angular/router'
import { ReactiveFormsModule } from '@angular/forms'
import { SupportDetailsComponent } from './details.component'

import { PledgeModule } from '../../components/pledge/pledge.module'
import { SupportDecisionComponent } from '../../components/decision/decision.component'
import { SupportRolePipeModule } from '../../pipes/role.pipe'

import { PostComponentModule } from '@strive/post/components/post/post.module'
import { IonList, IonItem, IonInput, IonButton, IonContent } from '@ionic/angular/standalone'

@NgModule({
  imports: [
    CommonModule,
    PledgeModule,
    RouterModule,
    ReactiveFormsModule,
    SupportDecisionComponent,
    PostComponentModule,
    SupportRolePipeModule,
    IonList,
    IonItem,
    IonInput,
    IonButton,
    IonContent
  ],
  declarations: [SupportDetailsComponent],
  exports: [SupportDetailsComponent]
})
export class SupportDetailsModule { }
