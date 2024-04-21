import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'

import { IonicModule } from '@ionic/angular'

import { GoalComponent } from './goal.component'
import { PageLoadingComponent } from '@strive/ui/page-loading/page-loading.component'
import { ImageSelectorComponent } from '@strive/media/components/image-selector/image-selector.component'
import { SelectUserModalComponent } from '@strive/ui/select-user/select-user.modal'
import { DescriptionComponent } from '@strive/ui/description/description.component'

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    PageLoadingComponent,
    ImageSelectorComponent,
    SelectUserModalComponent,
    DescriptionComponent
  ],
  declarations: [GoalComponent],
  exports: [GoalComponent]
})
export class GoalPageModule {}
