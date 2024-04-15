import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { Routes, RouterModule } from '@angular/router'
import { SupportsPageComponent } from './supports.page'

import { PageLoadingModule } from '@strive/ui/page-loading/page-loading.module'
import { HeaderRootModule } from '@strive/ui/header-root/header-root.module'

import { SupportListModule } from '@strive/support/components/list/list.module'
import { MilestonePathPipeModule } from '@strive/roadmap/pipes/path.pipe'
import { IonContent, IonRefresher, IonRefresherContent } from '@ionic/angular/standalone'

const routes: Routes = [
  {
    path: '',
    component: SupportsPageComponent
  }
]

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    PageLoadingModule,
    HeaderRootModule,
    SupportListModule,
    MilestonePathPipeModule,
    IonContent,
    IonRefresher,
    IonRefresherContent
  ],
  declarations: [
    SupportsPageComponent,
  ]
})
export class SupportsPageModule { }
