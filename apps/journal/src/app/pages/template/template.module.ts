import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';
// Pages
import { TemplatePage } from './template.page';
// Modals
import { CreateTemplateModalPageModule } from './modals/create-template-modal/create-template-modal.module'
// Popover
import { TemplateOptionsPopoverPage } from './popovers/template-options-popover/template-options-popover.page'
// Components
import { RoadmapModule } from '../goal/roadmap/components/roadmap.module';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { HeaderModule } from '@strive/ui/header/header.module';
import { TextEditorModule } from '@strive/ui/text-editor/text-editor.module';

const routes: Routes = [
  {
    path: '',
    component: TemplatePage
  },
  { path: 'edit', loadChildren: () => import('../goal/roadmap/pages/edit-default-roadmap/edit-default-roadmap.module').then(m => m.EditDefaultRoadmapPageModule) },
];

@NgModule({
  imports: [
    CommonModule,
    FontAwesomeModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    RoadmapModule,
    HeaderModule,
    CreateTemplateModalPageModule,
    TextEditorModule
  ],
  declarations: [
    TemplatePage,
    TemplateOptionsPopoverPage,
  ],
  entryComponents: [
    TemplateOptionsPopoverPage,
  ]
})
export class TemplatePageModule {}
