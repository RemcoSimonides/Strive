import { CommonModule, Location } from '@angular/common'
import { Component, Input } from '@angular/core'
import { Router } from '@angular/router'
import { IonicModule, ModalController, Platform } from '@ionic/angular'
import { ImageModule } from '@strive/media/directives/image.module'
import { createGoal, Stakeholder } from '@strive/model'
import { ModalDirective } from '@strive/utils/directives/modal.directive'
import { delay } from '@strive/utils/helpers'
import { ProgressPipeModule } from '@strive/goal/pipes/progress.pipe'


@Component({
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    ImageModule,
    ProgressPipeModule
  ],
  selector: 'strive-collective-goals-modal',
  templateUrl: './collective-goals.component.html',
  styleUrls: ['./collective-goals.component.scss']
})
export class CollectiveGoalsModalSComponent extends ModalDirective {

  @Input() goal = createGoal()
  @Input() stakeholders: Stakeholder[] = []

  constructor(
    protected override location: Location,
    protected override modalCtrl: ModalController,
    protected override platform: Platform,
    private router: Router
  ) {
    super(location, modalCtrl, platform)
  }

  navTo(goalId: string) {
    this.location.back()
    delay(250).then(_ => {
      this.router.navigate(['/goal', goalId])
    })
  }

}