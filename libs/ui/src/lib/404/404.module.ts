import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { RouterModule } from '@angular/router';
import { IonicModule } from "@ionic/angular";

import { PagenotfoundComponent } from './404.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    IonicModule
  ],
  declarations: [PagenotfoundComponent],
  exports: [PagenotfoundComponent]
})
export class PagenotfoundModule {}