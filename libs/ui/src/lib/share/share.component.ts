import { Component, OnInit, Input } from '@angular/core';
import { InviteTokenService } from '@strive/utils/services/invite-token.service';
import { ShareService } from 'ngx-sharebuttons';
import { boolean } from '@strive/utils/decorators/decorators';

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
  @Input() @boolean isCollectiveGoal: boolean
  @Input() title: string
  @Input() description: string
  @Input() image: string

  public ref: string
  public isCopied = false

  constructor(
    private inviteTokenService: InviteTokenService,
    public share: ShareService
  ) {}

  async ngOnInit() {
    this.ref = await this.inviteTokenService.getShareLink(this.id, this.isCollectiveGoal, this.isPublic, this.isAdmin)

    // define image
    if (this.image.toLowerCase() === 'assets/goal.jpg') {
      // set default Strive Journal image
      this.image = ''
    }
  }

  public copyUrl() {
    Clipboard.write({ string: this.ref })
  }
}
