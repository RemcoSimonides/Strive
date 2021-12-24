import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

import { IonicModule } from '@ionic/angular';
// Pages
import { TemplatePage } from './template.page';
// Modals
import { UpsertTemplateModalPageModule } from '@strive/template/modals/upsert/upsert-template-modal.module';
// Popover
import { TemplateOptionsPopoverPage } from './popovers/template-options-popover/template-options-popover.page'
// Components
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { HeaderModule } from '@strive/ui/header/header.module';
import { TextEditorModule } from '@strive/ui/text-editor/text-editor.module';
// import { RoadmapModule } from '@strive/ui/roadmap/roadmap.module';
// Guards
import { CollectiveGoalGuard } from '@strive/collective-goal/collective-goal/guards/collective-goal.guard';
// Strive
import { ImageModule } from '@strive/media/directives/image.module';


const routes: Routes = [
  {
    path: '',
    component: TemplatePage,
    canActivate: [CollectiveGoalGuard]
  }
];

@NgModule({
  imports: [
    CommonModule,
    FontAwesomeModule,
    FlexLayoutModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    // RoadmapModule,
    HeaderModule,
    UpsertTemplateModalPageModule,
    TextEditorModule,
    ImageModule
  ],
  declarations: [
    TemplatePage,
    TemplateOptionsPopoverPage,
  ]
})
export class TemplatePageModule {}
