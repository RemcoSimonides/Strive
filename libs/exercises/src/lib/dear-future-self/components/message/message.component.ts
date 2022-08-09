import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Location } from '@angular/common';
import { PopoverController } from '@ionic/angular';
import { Message } from '@strive/model';
import { PopoverDirective } from '@strive/utils/directives/popover.directive';

@Component({
  selector: '[message] exercises-dear-future-self-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MessagePopoverComponent extends PopoverDirective {
  @Input() message!: Message

  constructor(
    protected override location: Location,
    protected override popoverCtrl: PopoverController
  ) {
    super(location, popoverCtrl)
  }
}