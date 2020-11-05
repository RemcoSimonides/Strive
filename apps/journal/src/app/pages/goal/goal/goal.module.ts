import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';

import { GoalPage } from './goal.page';

import { ChatModalModule } from '@strive/chat/components/chat-modal/chat-modal.module'
import { GoalOptionsModule } from '../popovers/options/options.module'
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'
import { ComponentsModule } from 'apps/journal/src/app/components/components.module'

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    FontAwesomeModule,
    RouterModule,
    
    // Strive
    ChatModalModule,
    GoalOptionsModule,
    ComponentsModule
  ],
  exports: [GoalPage],
  declarations: [GoalPage],
})
export class GoalPageModule { }
