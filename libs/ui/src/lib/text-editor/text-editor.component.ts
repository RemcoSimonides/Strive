import { Component, Output, EventEmitter, Input } from '@angular/core';

import * as QuillNamespace from 'quill';
import ImageResize from 'quill-image-resize-module';
import { ImageDrop } from 'quill-image-drop-module';

let Quill: any = QuillNamespace;
Quill.register('modules/imageResize', ImageResize);
Quill.register('modules/imageDrop', ImageDrop);


@Component({
  selector: 'strive-text-editor',
  templateUrl: './text-editor.component.html',
  styleUrls: ['./text-editor.component.scss'],
})
export class TextEditorComponent {

  @Input() description: string
  @Input() isAdmin: boolean = true
  @Input() editMode: boolean = false

  @Output() update = new EventEmitter<string>()

  public editorStyle = {
    height: '300px',
    width: '100%'
  }

  public editorConfig = {
    toolbar: {
      container: [
        ['bold', 'italic', 'underline'],
        [{'header': 1}, {'header': 2}],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'indent': '-1'}, { 'indent': '+1' }],
        ['link', 'image', 'video'],
      ]
    },
    imageResize: true,
    imageDrop: true,
  }

  public async saveDescription() {
    this.editMode = false
    this.update.emit(this.description)
  }
}
