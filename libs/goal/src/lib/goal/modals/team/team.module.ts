import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { TeamModalComponent } from "./team.modal";

import { ImageModule } from '@strive/media/directives/image.module';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'


@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    IonicModule,
    ImageModule,
    FontAwesomeModule,
    ReactiveFormsModule
  ],
  declarations: [TeamModalComponent]
})
export class TeamModalModule { }