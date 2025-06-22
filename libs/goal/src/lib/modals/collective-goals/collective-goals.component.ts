import { Location } from '@angular/common'
import { Component, Input, inject } from '@angular/core'
import { Router } from '@angular/router'
import { IonContent, IonList, IonItem, IonAvatar, IonLabel, IonProgressBar, ModalController } from '@ionic/angular/standalone'
import { ImageDirective } from '@strive/media/directives/image.directive'
import { createGoal, Stakeholder } from '@strive/model'
import { ModalDirective } from '@strive/utils/directives/modal.directive'
import { ProgressPipe } from '@strive/goal/pipes/progress.pipe'
import { HeaderModalComponent } from '@strive/ui/header-modal/header-modal.component'

@Component({
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
  protected override location: Location;
  protected override modalCtrl: ModalController;
  private router = inject(Router);


  @Input() goal = createGoal()
  @Input() stakeholders: Stakeholder[] = []

  constructor() {
    const location = inject(Location);
    const modalCtrl = inject(ModalController);

    super(location, modalCtrl)

    this.location = location;
    this.modalCtrl = modalCtrl;
  }

  navTo(goalId: string) {
    const path = ['/goal', goalId]
    this.navigateTo(this.router, path)
  }

}
