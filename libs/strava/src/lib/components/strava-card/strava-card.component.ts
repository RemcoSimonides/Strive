import { ChangeDetectionStrategy, Component, Input } from '@angular/core'
import { StravaIntegration, User } from '@strive/model'

import { IonAvatar, IonCard, IonCardContent } from '@ionic/angular/standalone'

import { CompactPipe, CompactDistancePipe, CompactTimePipe } from '@strive/utils/pipes/compact.pipe'
import { ImageDirective } from '@strive/media/directives/image.directive'

@Component({
    selector: '[strava-integration] strive-strava-card',
    templateUrl: './strava-card.component.html',
    styleUrls: ['./strava-card.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        CompactDistancePipe,
        CompactTimePipe,
        CompactPipe,
        IonAvatar,
        IonCard,
        IonCardContent,
        ImageDirective
    ]
})
export class StravaCardComponent {
  @Input('strava-integration') strava?: StravaIntegration & { profile: User }

}