import { Location } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { PopoverDirective } from '@strive/utils/directives/popover.directive';

@Component({
  selector: 'exercise-affirmation-explanation',
  templateUrl: 'explanation.component.html',
  styleUrls: ['./explanation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AffirmationExplanationComponent extends PopoverDirective {

  constructor(
    protected location: Location,
    protected popoverCtrl: PopoverController
  ) {
    super(location, popoverCtrl)
  }
}