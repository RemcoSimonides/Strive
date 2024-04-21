import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { Routes, RouterModule } from '@angular/router'
import { SupportsPageComponent } from './supports.page'

import { PageLoadingComponent } from '@strive/ui/page-loading/page-loading.component'
import { HeaderRootComponent } from '@strive/ui/header-root/header-root.component'

import { SupportListComponent } from '@strive/support/components/list/list.component'
import { MilestonePathPipe } from '@strive/roadmap/pipes/path.pipe'
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
    PageLoadingComponent,
    HeaderRootComponent,
    SupportListComponent,
    MilestonePathPipe,
    IonContent,
    IonRefresher,
    IonRefresherContent
  ],
  declarations: [
    SupportsPageComponent,
  ]
})
export class SupportsPageModule { }
