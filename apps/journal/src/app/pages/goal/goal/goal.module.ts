import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { FlexLayoutModule } from '@angular/flex-layout';

import { GoalPage } from './goal.page';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'
import { DiscussionModalModule } from '@strive/discussion/components/discussion-modal/discussion-modal.module'
import { GoalOptionsModule } from '../popovers/options/options.module'
import { GoalSharePopoverModule } from '../popovers/share/share.module'
import { UpsertGoalModalModule } from '@strive/goal/goal/components/upsert/upsert.module';
import { TeamModalModule } from '@strive/goal/goal/modals/team/team.module';
import { TextEditorModule } from '@strive/ui/text-editor/text-editor.module';
import { ImageModule } from '@strive/media/directives/image.module';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    FontAwesomeModule,
    RouterModule,
    FlexLayoutModule,
    
    // Strive
    DiscussionModalModule,
    GoalOptionsModule,
    GoalSharePopoverModule,
    UpsertGoalModalModule,
    TeamModalModule,
    TextEditorModule,
    ImageModule
  ],
  exports: [GoalPage],
  declarations: [GoalPage],
})
export class GoalPageModule { }
