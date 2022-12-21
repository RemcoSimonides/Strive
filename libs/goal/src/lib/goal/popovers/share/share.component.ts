import { Component, Input } from '@angular/core';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: '[url] goal-share-popover',
  templateUrl: './share.component.html',
  styleUrls: ['./share.component.scss'],
})
export class GoalSharePopoverComponent {

  @Input() url = ''

  constructor(private popoverCtrl: PopoverController) {}

  close() {
    this.popoverCtrl.dismiss()
  }
}
