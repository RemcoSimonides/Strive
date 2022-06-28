import { ChangeDetectionStrategy, Component } from "@angular/core";
import { Location } from '@angular/common';
import { PopoverController } from "@ionic/angular";
import { PopoverDirective } from "@strive/utils/directives/popover.directive";

@Component({
  selector: 'exercises-dear-future-self-explanation',
  templateUrl: './explanation.component.html',
  styleUrls: ['./explanation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DearFutureSelfExplanationComponent extends PopoverDirective {
  constructor(
    protected location: Location,
    protected popoverCtrl: PopoverController
  ) {
    super(location, popoverCtrl)
  }
}