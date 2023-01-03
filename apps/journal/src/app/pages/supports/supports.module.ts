import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { Routes, RouterModule } from '@angular/router'

import { IonicModule } from '@ionic/angular'

import { SupportsPageComponent } from './supports.page'

import { PageLoadingModule } from '@strive/ui/page-loading/page-loading.module'
import { HeaderRootModule } from '@strive/ui/header-root/header-root.module'

import { SupportListModule } from '@strive/support/components/list/list.module'
import { MilestonePathPipeModule } from '@strive/roadmap/pipes/path.pipe'

const routes: Routes = [
  {
    path: '',
    component: SupportsPageComponent
  }
]

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    RouterModule.forChild(routes),
    PageLoadingModule,
    HeaderRootModule,
    SupportListModule,
    MilestonePathPipeModule
  ],
  declarations: [
    SupportsPageComponent,
  ]
})
export class SupportsPageModule {}
