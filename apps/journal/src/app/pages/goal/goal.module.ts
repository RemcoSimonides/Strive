import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';
// Services
import { AuthGuardService } from '../../services/auth-guard/auth-guard.service'
import { GoalAuthGuardService } from 'apps/journal/src/app/services/goal/goal-auth-guard.service';

// Pages
import { GoalPage } from './goal.page';
import { AddSupportModalPage } from './modals/add-support-modal/add-support-modal.page'

// Pipes
import { PipesModule } from '../../pipes/pipes.module'

// Popover
import { GoalOptionsPopoverPage } from './popovers/goal-options-popover/goal-options-popover.page'
import { GoalSharePopoverPage } from './popovers/goal-share-popover/goal-share-popover.page'

// Components
import { ComponentsModule } from '../../components/components.module'
import { RoadmapModule } from './roadmap/components/roadmap.module'
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { QuillModule } from 'ngx-quill'

const routes: Routes = [
  { path: '', component: GoalPage },
  { path: 'edit', loadChildren: () => import('./roadmap/pages/edit-default-roadmap/edit-default-roadmap.module').then(m => m.EditDefaultRoadmapPageModule), canActivate: [AuthGuardService, GoalAuthGuardService] },
];

@NgModule({
  imports: [
    CommonModule,
    FontAwesomeModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    ComponentsModule,
    PipesModule,
    RoadmapModule,
    QuillModule
  ],
  declarations: [
    GoalPage,
    GoalOptionsPopoverPage,
    GoalSharePopoverPage,
    AddSupportModalPage,
  ],
  entryComponents: [
    AddSupportModalPage,
    GoalOptionsPopoverPage,
    GoalSharePopoverPage
  ]
})
export class GoalPageModule {}
