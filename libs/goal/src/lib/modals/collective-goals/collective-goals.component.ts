import { Location } from '@angular/common'
import { Component, Input } from '@angular/core'
import { Router } from '@angular/router'
import { IonContent, IonList, IonItem, IonAvatar, IonLabel, IonProgressBar, ModalController } from '@ionic/angular/standalone'
import { ImageDirective } from '@strive/media/directives/image.directive'
import { createGoal, Stakeholder } from '@strive/model'
import { ModalDirective } from '@strive/utils/directives/modal.directive'
import { ProgressPipe } from '@strive/goal/pipes/progress.pipe'
import { HeaderModalComponent } from '@strive/ui/header-modal/header-modal.component'

@Component({
  standalone: true,
  imports: [
    ImageDirective,
    ProgressPipe,
    HeaderModalComponent,
    IonContent,
    IonList,
    IonItem,
    IonAvatar,
    IonLabel,
    IonProgressBar
  ],
  selector: 'strive-collective-goals-modal',
  templateUrl: './collective-goals.component.html',
  styleUrls: ['./collective-goals.component.scss']
})
export class CollectiveGoalsModalComponent extends ModalDirective {

  @Input() goal = createGoal()
  @Input() stakeholders: Stakeholder[] = []

  constructor(
    protected override location: Location,
    protected override modalCtrl: ModalController,
    private router: Router
  ) {
    super(location, modalCtrl)
  }

  navTo(goalId: string) {
    const path = ['/goal', goalId]
    this.navigateTo(this.router, path)
  }

}
