import { CommonModule, Location } from '@angular/common'
import { Component, Input } from '@angular/core'
import { Router } from '@angular/router'
import { IonContent, IonList, IonItem, IonAvatar, IonLabel, IonProgressBar, ModalController } from '@ionic/angular/standalone'
import { ImageModule } from '@strive/media/directives/image.module'
import { createGoal, Stakeholder } from '@strive/model'
import { ModalDirective } from '@strive/utils/directives/modal.directive'
import { ProgressPipe } from '@strive/goal/pipes/progress.pipe'
import { HeaderModalComponent } from '@strive/ui/header-modal/header-modal.component'

@Component({
  standalone: true,
  imports: [
    CommonModule,
    ImageModule,
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
export class CollectiveGoalsModalSComponent extends ModalDirective {

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
