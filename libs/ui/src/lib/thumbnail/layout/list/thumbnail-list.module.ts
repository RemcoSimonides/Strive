import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'

import { ThumbnailListComponent } from './thumbnail-list.component'
import { IonicModule } from '@ionic/angular'

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
  ],
  exports: [ThumbnailListComponent],
  declarations: [ThumbnailListComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ThumbnailListModule { }
