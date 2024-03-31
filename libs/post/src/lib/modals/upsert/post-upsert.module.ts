import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ReactiveFormsModule } from '@angular/forms'

import { IonicModule } from '@ionic/angular'

import { UpsertPostModalComponent } from './post-upsert.component'

import { DatetimeModule } from '@strive/ui/datetime/datetime.module'
import { SafePipe } from '@strive/utils/pipes/safe-url.pipe'
import { ImagesSelectorComponent } from '@strive/media/components/images-selector/images-selector.component'

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule,
    ImagesSelectorComponent,
    DatetimeModule,
    SafePipe
  ],
  declarations: [UpsertPostModalComponent]
})
export class UpsertPostModalModule {}
