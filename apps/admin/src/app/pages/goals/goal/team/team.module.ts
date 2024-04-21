import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router'

import { IonicModule } from '@ionic/angular'

import { TeamComponent } from './team.component'
import { PageLoadingComponent } from '@strive/ui/page-loading/page-loading.component'
import { SelectUserModalComponent } from '@strive/ui/select-user/select-user.modal'

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    RouterModule,
    PageLoadingComponent,
    SelectUserModalComponent
  ],
  declarations: [TeamComponent],
  exports: [TeamComponent]
})
export class TeamModule {}
