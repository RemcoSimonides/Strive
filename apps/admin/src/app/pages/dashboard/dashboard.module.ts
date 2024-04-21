import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { IonicModule } from '@ionic/angular'

import { DashboardComponent } from './dashboard.component'

import { PageLoadingComponent } from '@strive/ui/page-loading/page-loading.component'
import { AggregationPipeModule } from './dashboard.pipe'

const routes: Routes = [
  {
    path: '',
    component: DashboardComponent
  }
]

@NgModule({
	imports: [
		CommonModule,
		IonicModule,
    RouterModule.forChild(routes),
		PageLoadingComponent,
		AggregationPipeModule
	],
	declarations: [
		DashboardComponent
	]
})
export class DashboardModule {}