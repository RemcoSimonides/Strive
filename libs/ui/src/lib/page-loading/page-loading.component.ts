import { ChangeDetectionStrategy, Component } from '@angular/core'
import { IonSpinner } from '@ionic/angular/standalone'

@Component({
    selector: 'strive-page-loading',
    templateUrl: 'page-loading.component.html',
    styleUrls: ['./page-loading.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        IonSpinner
    ]
})
export class PageLoadingComponent { }
