import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { PostOptionsComponent } from './options.component'
import { UpsertPostModalComponent } from '../../modals/upsert/post-upsert.component'
import { IonList, IonItem } from '@ionic/angular/standalone'

@NgModule({
  imports: [
    CommonModule,
    UpsertPostModalComponent,
    IonList,
    IonItem
  ],
  declarations: [
    PostOptionsComponent
  ]
})
export class PostOptionsModule { }
