import { CommonModule } from '@angular/common'
import { ReactiveFormsModule } from '@angular/forms'
import { NgModule } from '@angular/core'

import { AssessLifeEntryComponent } from './assess-life-entry.component'
import { IonicModule } from '@ionic/angular'

import { PageLoadingModule } from '@strive/ui/page-loading/page-loading.module'

import { AssessLifeIntroComponent } from '../intro/intro.component'
import { AssessLifeTimeManagementPastComponent } from '../time-management/past/time-management-past.component'
import { AssessLifeTimeManagementFutureComponent } from '../time-management/future/time-management-future.component'
import { AssessLifeOutroComponent } from '../outro/outro.component'

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    ReactiveFormsModule,

    PageLoadingModule,

    AssessLifeIntroComponent,
    AssessLifeTimeManagementPastComponent,
    AssessLifeTimeManagementFutureComponent,
    AssessLifeOutroComponent
  ],
  declarations: [AssessLifeEntryComponent],
  exports: [AssessLifeEntryComponent]
})
export class AssessLifeEntryModule {}