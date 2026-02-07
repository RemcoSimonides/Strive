import { ChangeDetectionStrategy, Component, Input, OnInit, ViewChild, inject } from '@angular/core'
import { IonHeader, IonToolbar, IonButtons, IonButton, IonIcon, IonTitle, IonContent, IonFooter } from '@ionic/angular/standalone'
import { addIcons } from 'ionicons'
import { close } from 'ionicons/icons'
import { ModalDirective } from '@strive/utils/directives/modal.directive'

import { GoalDetailsComponent } from '../components/details/details.component'
import { GoalImagesComponent } from '../components/images/images.component'
import { Goal } from '@strive/model'
import { GoalForm } from '@strive/goal/forms/goal.form'
import { GoalService } from '@strive/goal/goal.service'
import { AuthService } from '@strive/auth/auth.service'

@Component({
    selector: 'strive-goal-update',
    templateUrl: './update.component.html',
    styleUrls: ['./update.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        GoalDetailsComponent,
        GoalImagesComponent,
        IonHeader,
        IonToolbar,
        IonButtons,
        IonButton,
        IonIcon,
        IonTitle,
        IonContent,
        IonFooter
    ]
})
export class GoalUpdateModalComponent extends ModalDirective implements OnInit {
  private auth = inject(AuthService);
  private goalService = inject(GoalService);

  @ViewChild(GoalImagesComponent) imagesComponent?: GoalImagesComponent

  form?: GoalForm

  @Input() goal?: Goal

  constructor() {
    super()

    addIcons({ close })
  }

  ngOnInit() {
    if (!this.goal) throw new Error('No goal found to edit')

    this.form = new GoalForm(this.goal)
  }

  async save() {
    if (!this.form || this.form.invalid) return
    if (!this.goal) return
    const uid = this.auth.uid()
    if (!uid) return

    if (this.form.image.dirty) {
      this.imagesComponent?.cropImage()
    }

    const goal = { ...this.form.getGoalValue(), id: this.goal.id }
    await this.goalService.update(goal.id, goal)
    this.dismiss()
  }
}
