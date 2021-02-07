import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { FlexLayoutModule } from '@angular/flex-layout';

import { GoalPage } from './goal.page';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'
import { ChatModalModule } from '@strive/chat/components/chat-modal/chat-modal.module'
import { GoalOptionsModule } from '../popovers/options/options.module'
import { GoalSharePopoverModule } from '../popovers/share/share.module'
import { CreateGoalPageModule } from 'apps/journal/src/app/pages/goal/modals/create-goal/create-goal.module'
import { TextEditorModule } from '@strive/ui/text-editor/text-editor.module';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    FontAwesomeModule,
    RouterModule,
    FlexLayoutModule,
    
    // Strive
    ChatModalModule,
    GoalOptionsModule,
    GoalSharePopoverModule,
    CreateGoalPageModule,
    TextEditorModule
  ],
  exports: [GoalPage],
  declarations: [GoalPage],
})
export class GoalPageModule { }
