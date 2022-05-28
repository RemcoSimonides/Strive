import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'strive-page-not-found',
  templateUrl: './404.component.html',
  styleUrls: ['./404.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotfoundComponent {}