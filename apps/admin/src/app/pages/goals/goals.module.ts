import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { RouterModule, Routes } from '@angular/router'

import { IonicModule } from '@ionic/angular'

import { GoalsComponent } from './goals.page'
import { PageLoadingModule } from '@strive/ui/page-loading/page-loading.module'
import { SelectUserModule } from '@strive/ui/select-user/select-user.module'


const routes: Routes = [
  {
    path: '',
    component: GoalsComponent
  },
  {
    path: ':id',
    loadChildren: () => import('./goal/view.module').then(m => m.GoalViewModule)
  }
]

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    PageLoadingModule,
    SelectUserModule
  ],
  declarations: [GoalsComponent]
})
export class GoalsPageModule {}
