import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';

import { HeaderRootComponent } from './header-root.component';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    RouterModule
  ],
  exports: [HeaderRootComponent],
  declarations: [HeaderRootComponent],
})
export class HeaderRootModule { }
