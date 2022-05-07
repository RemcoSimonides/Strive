import { Location } from '@angular/common';
import { Component, HostBinding, HostListener } from '@angular/core';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'exercise-affirmation-explanation',
  templateUrl: 'explanation.component.html',
  styleUrls: ['./explanation.component.scss']
})
export class AffirmationExplanationComponent {
  @HostListener('window:popstate', ['$event'])
  onPopState() {
    this.popoverCtrl.dismiss()
  }
  @HostBinding() popover: HTMLIonPopoverElement

  constructor(
    private location: Location,
    private popoverCtrl: PopoverController
  ) {
    window.history.pushState(null, null, window.location.href)
  }

  async ngOnInit() {
    this.popover.onWillDismiss().then(res => {
      if (res.role === 'backdrop') this.location.back()
    })
  }
}