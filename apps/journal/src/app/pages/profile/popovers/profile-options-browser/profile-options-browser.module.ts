import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ProfileOptionsBrowserPageRoutingModule } from './profile-options-browser-routing.module';

import { ProfileOptionsBrowserPage } from './profile-options-browser.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ProfileOptionsBrowserPageRoutingModule
  ],
  declarations: []
})
export class ProfileOptionsBrowserPageModule {}
