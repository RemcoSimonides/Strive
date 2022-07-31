import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from "@ionic/angular";
import { AchieversPopoverComponent } from "./achievers.component";
import { ImageModule } from '@strive/media/directives/image.module';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    ReactiveFormsModule,
    ImageModule
  ],
  declarations: [AchieversPopoverComponent]
})
export class AchieversPopoverModule {}