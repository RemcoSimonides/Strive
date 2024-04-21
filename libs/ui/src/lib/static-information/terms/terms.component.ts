import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component } from '@angular/core'

@Component({
  standalone: true,
  selector: 'strive-terms',
  styleUrls: ['./terms.component.scss'],
  templateUrl: './terms.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule
  ]
})
export class TermsComponent { }
