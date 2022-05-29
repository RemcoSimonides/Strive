import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { IonicModule } from "@ionic/angular";

import { SettingsPageComponent } from "./settings.component";

import { AuthGuardService } from "@strive/user/auth/guard/auth-guard.service";
import { HeaderModule } from '@strive/ui/header/header.module';

const routes: Routes = [
  {
    path: '',
    component: SettingsPageComponent,
    canActivate: [AuthGuardService]
  }
]

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    RouterModule.forChild(routes),
    HeaderModule
  ],
  declarations: [SettingsPageComponent]
})
export class SettingsPageModule {}