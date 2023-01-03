import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { RouterModule, Routes } from '@angular/router'

import { IonicModule } from '@ionic/angular'

import { UsersComponent } from './users.page'
import { PageLoadingModule } from '@strive/ui/page-loading/page-loading.module'

const routes: Routes = [
  {
    path: '',
    component: UsersComponent
  },
  {
    path: ':uid',
    loadChildren: () => import('./user/user.module').then(m => m.UserPageModule)
  }
]

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    PageLoadingModule
  ],
  declarations: [UsersComponent]
})
export class UsersPageModule {}
