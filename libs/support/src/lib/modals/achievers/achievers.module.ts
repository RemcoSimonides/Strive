import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { IonicModule } from '@ionic/angular'
import { AchieversModalComponent } from './achievers.component'
import { ImageModule } from '@strive/media/directives/image.module'
import { HeaderModalComponent } from '@strive/ui/header-modal/header-modal.component'

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    ReactiveFormsModule,
    FormsModule,
    ImageModule,
    HeaderModalComponent
  ],
  declarations: [AchieversModalComponent]
})
export class AchieversModalModule {}