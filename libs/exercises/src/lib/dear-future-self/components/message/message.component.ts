import { ChangeDetectionStrategy, Component, HostBinding, HostListener, Input } from '@angular/core';
import { Location } from '@angular/common';
import { PopoverController } from '@ionic/angular';
import { Message } from '../../+state/dear-future-self.firestore';

@Component({
  selector: 'exercises-dear-future-self-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MessagePopoverComponent {
  @HostListener('window:popstate', ['$event'])
  onPopState() {
    this.popoverCtrl.dismiss()
  }
  @HostBinding() popover: HTMLIonPopoverElement

  @Input() message: Message

  constructor(
    private location: Location,
    private popoverCtrl: PopoverController
  ) {
    window.history.pushState(null, null, window.location.href)
  }

  ngOnInit() {
    this.popover.onWillDismiss().then(res => {
      if (res.role === 'backdrop') this.location.back()
    })
  }
}