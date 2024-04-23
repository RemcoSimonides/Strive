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
  `]
})
export class CopiedPopoverComponent {
  @Input() content = ''
}
