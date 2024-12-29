import { ChangeDetectionStrategy, Component } from '@angular/core'
import { PagenotfoundComponent } from '@strive/ui/404/404.component'

@Component({
    selector: 'journal-page-not-found',
    template: `<strive-404/>`,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [PagenotfoundComponent]
})
export class NotfoundPageComponent {}
