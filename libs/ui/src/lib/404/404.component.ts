import { ChangeDetectionStrategy, Component } from '@angular/core'
import { Location } from '@angular/common'
import { SeoService } from "@strive/utils/services/seo.service"

@Component({
  selector: 'strive-404',
  templateUrl: './404.component.html',
  styleUrls: ['./404.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PagenotfoundComponent {
  hasBack = false

  constructor(
    private location: Location,
    seo: SeoService
  ) {
    seo.generateTags({ title: `Page not found - Strive Journal` })

    const state = this.location.getState() as { navigationId: number }
    this.hasBack = state?.navigationId > 1
  }

  goBack() {
    this.location.back()
  }
}