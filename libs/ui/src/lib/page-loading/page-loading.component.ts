import { ChangeDetectionStrategy, Component } from '@angular/core'

@Component({
  selector: 'strive-page-loading',
  templateUrl: 'page-loading.component.html',
  styleUrls: ['./page-loading.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PageLoadingComponent {}