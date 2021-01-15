import { Component, OnInit, Input } from '@angular/core';
import { InviteTokenService } from '@strive/utils/services/invite-token.service';
import { ShareService } from 'ngx-sharebuttons';

import { Plugins }  from '@capacitor/core'
const { Clipboard } = Plugins

@Component({
  selector: 'strive-share',
  templateUrl: './share.component.html',
  styleUrls: ['./share.component.scss'],
})
export class ShareComponent implements OnInit {

  @Input() isAdmin: boolean
  @Input() isPublic: boolean

  @Input() id: string
  @Input() isCollectiveGoal: boolean
  @Input() title: string
  @Input() description: string
  @Input() image: string

  public _ref: string
  public _isCopied: boolean = false

  constructor(
    private _inviteTokenService: InviteTokenService,
    public share: ShareService
  ) {


  }

  async ngOnInit() {

    this._ref = await this._inviteTokenService.getShareLink(this.id, this.isCollectiveGoal, this.isPublic, this.isAdmin)

    // define image
    if (this.image.toLowerCase() === 'assets/goal.jpg') {
      // set default Strive Journal image
      this.image = ''
    }

  }

  public async _copyUrl(): Promise<void> {

    Clipboard.write({
      string: this._ref
    })

  }

}
