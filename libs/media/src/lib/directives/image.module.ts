import { NgModule } from '@angular/core';
import { ImageDirective } from './image.directive';

@NgModule({
  declarations: [ImageDirective],
  exports: [ImageDirective]
})
export class ImageModule {}
