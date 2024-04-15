import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { PostOptionsComponent } from './options.component'
import { UpsertPostModalModule } from '../../modals/upsert/post-upsert.module'
import { IonList, IonItem } from '@ionic/angular/standalone'

@NgModule({
  imports: [
    CommonModule,
    UpsertPostModalModule,
    IonList,
    IonItem
  ],
  declarations: [
    PostOptionsComponent
  ]
})
export class PostOptionsModule { }
