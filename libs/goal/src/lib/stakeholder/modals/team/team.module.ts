import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { IonicModule } from '@ionic/angular';

import { TeamModalComponent } from "./team.modal";

import { ImageModule } from '@strive/media/directives/image.module';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'
import { RolesPopoverModule } from '../../popovers/roles/roles.module'


@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    IonicModule,
    ImageModule,
    FlexLayoutModule,
    FontAwesomeModule,
    ReactiveFormsModule,
    RolesPopoverModule
  ],
  declarations: [TeamModalComponent]
})
export class TeamModalModule { }