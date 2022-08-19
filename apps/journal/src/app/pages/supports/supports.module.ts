import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { Routes, RouterModule } from '@angular/router'

import { IonicModule } from '@ionic/angular'

import { SupportsComponent } from './supports.page'

import { HeaderModule } from '@strive/ui/header/header.module'
import { MilestonePathPipeModule } from '@strive/goal/milestone/pipes/path.pipe'
import { PageLoadingModule } from '@strive/ui/page-loading/page-loading.module'
import { SupportOptionsModule } from '@strive/support/components/options/options.module'
import { HeaderRootModule } from '@strive/ui/header-root/header-root.module'
import { ImageModule } from '@strive/media/directives/image.module'
import { SupportStatusPipeModule } from '@strive/support/pipes/status.pipe'

const routes: Routes = [
  {
    path: '',
    component: SupportsComponent
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    HeaderModule,
    MilestonePathPipeModule,
    PageLoadingModule,
    SupportOptionsModule,
    HeaderRootModule,
    ImageModule,
    SupportStatusPipeModule
  ],
  declarations: [
    SupportsComponent,
  ]
})
export class SupportsPageModule {}
