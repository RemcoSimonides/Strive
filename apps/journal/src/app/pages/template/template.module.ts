import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';
// Pages
import { TemplatePage } from './template.page';
// Modals
// import { CreateTemplateModalPage } from './modals/create-template-modal/create-template-modal.page'
// Popover
import { TemplateOptionsPopoverPage } from './popovers/template-options-popover/template-options-popover.page'
// Components
import { ComponentsModule } from '../../components/components.module';
import { RoadmapModule } from '../goal/roadmap/components/roadmap.module';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';


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
    ComponentsModule,
    FontAwesomeModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    RoadmapModule
  ],
  declarations: [
    TemplatePage,
    TemplateOptionsPopoverPage,
    // CreateTemplateModalPage
  ],
  entryComponents: [
    TemplateOptionsPopoverPage,
    // CreateTemplateModalPage
  ]
})
export class TemplatePageModule {}
