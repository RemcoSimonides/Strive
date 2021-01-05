import { Directive, EventEmitter, HostListener, Output } from '@angular/core';
import * as _ from 'lodash';

@Directive({
  selector: '[appFileDrop]'
})
export class FileDropDirective {

  @Output() dropped = new EventEmitter<FileList>()
  @Output() hovered = new EventEmitter()

  constructor() { }

  @HostListener('drop', ['$event'])
    onDrop($event) {
      $event.preventDefault()
      this.dropped.emit($event.dataTransfer.files)
      this.hovered.emit(false)
    }

  @HostListener('dragover', ['$event'])
    onDragOver($event) {
      $event.preventDefault()
      this.hovered.emit(true)
    }

  @HostListener('dragleave', ['$event'])
    onDragleave($event) {
      $event.preventDefault()
      this.hovered.emit(false)

    }

}
