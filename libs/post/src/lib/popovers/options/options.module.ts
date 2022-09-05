import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { IonicModule } from '@ionic/angular'

import { PostOptionsComponent } from './options.component'
import { UpsertPostModalModule } from '../../components/upsert-modal/upsert-modal.module'

@NgModule({
    imports: [
        CommonModule,
        IonicModule,
        UpsertPostModalModule
    ],
    declarations: [
        PostOptionsComponent
    ]
})
export class PostOptionsModule {}