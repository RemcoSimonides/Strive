import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { IonicModule } from "@ionic/angular";
import { AuthGuardService } from "@strive/user/auth/guard/auth-guard.service";

import { SettingsPageComponent } from "./settings.component";

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
    RouterModule.forChild(routes)
  ],
  declarations: [SettingsPageComponent]
})
export class SettingsPageModule {}