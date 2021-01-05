import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';

import { FileSelectorComponent } from './file-selector.component';
import { FileDropDirective } from '../../directives/file-drop/file-drop.directive';

@NgModule({
  imports: [
    CommonModule,
    IonicModule
  ],
  exports: [FileSelectorComponent],
  declarations: [
    FileDropDirective,
    FileSelectorComponent
  ]
})
export class FileSelectorModule { }
