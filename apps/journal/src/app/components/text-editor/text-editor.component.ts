import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';

import * as QuillNamespace from 'quill';
import { ImageDrop } from 'quill-image-drop-module'
// import ImageResize from 'quill-image-resize-module';
let Quill: any = QuillNamespace;
// Quill.register('modules/imageResize', ImageResize)
Quill.register('modules/imageDrop', ImageDrop)

@Component({
  selector: 'app-text-editor',
  templateUrl: './text-editor.component.html',
  styleUrls: ['./text-editor.component.scss'],
})
export class TextEditorComponent implements OnInit {

  @Input() _description: string
  @Input() isAdmin: boolean = true
  @Input() editMode: boolean = false

  @Output('update')
  public description: EventEmitter<string> = new EventEmitter<string>() 

  public _editorStyle = {
    height: '300px',
    width: '100%'
  }

  public _editorConfig = {
    toolbar: {
      container: [
        ['bold', 'italic', 'underline'],
        [{'header': 1}, {'header': 2}],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'indent': '-1'}, { 'indent': '+1' }],
        ['link', 'image', 'video'],
        // ['clean']
      ]
    },
    imageDrop: true,
    imageResize: {
      displayStyles: {
        backgroundColor: 'black',
        border: 'none',
        color: 'white'
      },
      modules: [ 'Resize', 'DisplaySize', 'Toolbar' ]
    }
  }

  constructor() { }

  ngOnInit() {}

  public async _saveDescription() {
    this.editMode = false
    this.description.emit(this._description)
  }

}
