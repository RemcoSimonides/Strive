import { ChangeDetectionStrategy, Component } from '@angular/core'

@Component({
  standalone: true,
  selector: 'strive-privacy-policy',
  templateUrl: './privacy-policy.component.html',
  styleUrls: ['./privacy-policy.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PrivacyPolicyComponent { }
