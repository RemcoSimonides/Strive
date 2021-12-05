import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { TeamModal } from "./team.modal";

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
  declarations: [TeamModal]
})
export class TeamModalModule { }