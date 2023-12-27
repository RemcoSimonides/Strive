import { CommonModule } from '@angular/common'
import { Component, Input } from '@angular/core'

@Component({
  standalone: true,
  selector: 'strive-share-popover',
  template: `<span>{{ content }}<span>`,
  styles: [`
    :host {
      display: block;
      padding: 12px;
    }
  `],
  imports: [ CommonModule ]
})
export class CopiedPopoverComponent {
  @Input() content = ''
}
