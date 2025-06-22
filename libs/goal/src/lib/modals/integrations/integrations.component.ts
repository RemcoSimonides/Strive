import { CommonModule, Location } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, OnInit, Pipe, PipeTransform } from '@angular/core'

import { IonContent, IonTitle, ModalController } from '@ionic/angular/standalone'
import { BehaviorSubject, combineLatest, filter, map, switchMap, tap } from 'rxjs'
import { where } from 'firebase/firestore'

import { HeaderModalComponent } from '@strive/ui/header-modal/header-modal.component'
import { PageLoadingComponent } from '@strive/ui/page-loading/page-loading.component'
import { ModalDirective } from '@strive/utils/directives/modal.directive'
import { ImageDirective } from '@strive/media/directives/image.directive'
import { StravaIntegration } from '@strive/model'
import { StravaService } from '@strive/strava/strava.service'
import { AuthService } from '@strive/auth/auth.service'
import { capitalizeFirstLetter } from '@strive/utils/helpers'

interface Integration {
  id: string
  name: string
  image: string
}

@Pipe({ name: 'activities', standalone: true })
export class StravaActivitiesPipe implements PipeTransform {
  transform(strava: StravaIntegration | undefined) {
    return strava?.activityTypes.map(type => capitalizeFirstLetter(type)).join(', ')
  }
}

@Component({
    selector: 'strive-integrations',
    templateUrl: './integrations.component.html',
    styleUrls: ['./integrations.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        CommonModule,
        StravaActivitiesPipe,
        HeaderModalComponent,
        PageLoadingComponent,
        ImageDirective,
        IonContent,
        IonTitle
    ]
})
export class IntegrationsComponent extends ModalDirective implements OnInit {

  @Input() goalId?: string

  activeIntegrations: Integration[] = []
  availableIntegrations: Integration[] = []

  private goalId$ = new BehaviorSubject(this.goalId)
  private strava$ = this.goalId$.pipe(
    filter(goalId => !!goalId),
    switchMap(goalId => this.stravaService.valueChanges([
      where('goalId', '==', goalId),
      where('userId', '==', this.auth.uid)]
    )),
    map(integrations => integrations.length ? integrations[0] : undefined),
    tap(strava => {
      const integration: Integration = {
        id: 'strava',
        name: 'Strava',
        image: 'strava.png'
      }

      if (strava) {
        this.activeIntegrations.push(integration)
      } else {
        this.availableIntegrations.push(integration)
      }
    })
  )

  view$ = combineLatest([
    this.strava$
  ]).pipe(
    map(([strava]) => ({ strava }))
  )

  constructor(
    private auth: AuthService,
    protected override location: Location,
    protected override modalCtrl: ModalController,
    private stravaService: StravaService
  ) {
    super(location, modalCtrl)
  }

  ngOnInit() {
    this.goalId$.next(this.goalId)
  }
}