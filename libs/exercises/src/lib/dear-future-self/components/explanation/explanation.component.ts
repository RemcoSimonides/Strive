import { ChangeDetectionStrategy, Component, HostBinding, HostListener } from "@angular/core";
import { Location } from '@angular/common';
import { PopoverController } from "@ionic/angular";

@Component({
  selector: 'exercises-dear-future-self-explanation',
  templateUrl: './explanation.component.html',
  styleUrls: ['./explanation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DearFutureSelfExplanationComponent {
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