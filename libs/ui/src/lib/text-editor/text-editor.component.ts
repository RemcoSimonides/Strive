import { Component, Output, EventEmitter, Input } from '@angular/core';

@Component({
  selector: 'strive-text-editor',
  templateUrl: './text-editor.component.html',
  styleUrls: ['./text-editor.component.scss'],
})
export class TextEditorComponent {

  @Input() description?: string
  @Input() isAdmin = true
  @Input() editMode = false

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
    }
  }

  public async saveDescription() {
    this.editMode = false
    this.update.emit(this.description)
  }
}
