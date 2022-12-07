import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { Routes, RouterModule } from '@angular/router'

import { IonicModule } from '@ionic/angular'

import { SupportsComponent } from './supports.page'

import { HeaderModule } from '@strive/ui/header/header.module'
import { MilestonePathPipeModule } from '@strive/goal/milestone/pipes/path.pipe'
import { PageLoadingModule } from '@strive/ui/page-loading/page-loading.module'
import { HeaderRootModule } from '@strive/ui/header-root/header-root.module'
import { ImageModule } from '@strive/media/directives/image.module'
import { PledgeModule } from '@strive/support/components/pledge/pledge.module'

const routes: Routes = [
  {
    path: '',
    component: SupportsComponent
  }
];

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    RouterModule.forChild(routes),
    HeaderModule,
    MilestonePathPipeModule,
    PageLoadingModule,
    HeaderRootModule,
    ImageModule,
    PledgeModule,
  ],
  declarations: [
    SupportsComponent,
  ]
})
export class SupportsPageModule {}
