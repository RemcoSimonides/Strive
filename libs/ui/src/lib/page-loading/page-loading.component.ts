import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core'
import { IonSpinner } from '@ionic/angular/standalone'

@Component({
  standalone: true,
  selector: 'strive-page-loading',
  templateUrl: 'page-loading.component.html',
  styleUrls: ['./page-loading.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    IonSpinner
  ]
})
export class PageLoadingComponent { }
