import { Component, Input } from '@angular/core';

import { Clipboard }  from '@capacitor/clipboard';


@Component({
  selector: '[url] strive-share',
  templateUrl: './share.component.html',
  styleUrls: ['./share.component.scss'],
})
export class ShareComponent {

  @Input() url!: string

  isCopied = false

  copyUrl() {
    Clipboard.write({ string: this.url })
    this.isCopied = true
  }
}
