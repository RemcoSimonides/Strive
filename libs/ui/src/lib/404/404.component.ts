import { ChangeDetectionStrategy, Component } from "@angular/core";
import { Location } from '@angular/common';

@Component({
  selector: 'strive-404',
  templateUrl: './404.component.html',
  styleUrls: ['./404.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PagenotfoundComponent {
  hasBack = false

  constructor(private location: Location) {
    const state = this.location.getState() as { navigationId: number }
    this.hasBack = state.navigationId > 1
  }

  goBack() {
    this.location.back()
  }
}