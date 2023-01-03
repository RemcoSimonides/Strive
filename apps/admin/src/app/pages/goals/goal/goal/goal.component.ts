import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import { AlertController } from '@ionic/angular'
import { Goal } from '@strive/model'
import { GoalService } from '@strive/goal/goal.service'
import { GoalForm } from '@strive/goal/forms/goal.form'
import { Observable } from 'rxjs'

@Component({
  selector: '[id] strive-goal',
  templateUrl: './goal.component.html',
  styleUrls: ['./goal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GoalComponent implements OnInit {

  goal$?: Observable<Goal | undefined>
  goalForm = new GoalForm()

  @Input() id!: string

  constructor(
    private alertCtrl: AlertController,
    private goal: GoalService,
    private router: Router
  ) {}

  ngOnInit() {
    this.goal$ = this.goal.valueChanges(this.id)
  }

  update() {
    if (this.goalForm.invalid) {
      console.error('invalid form')
      return
    }

    this.goal.update({ ...this.goalForm.value, id: this.id })
  }

  updateDescription(description: string) {
    this.goal.update(this.id, {
      description
    })
  }

  delete() {
    this.alertCtrl.create({
      subHeader: `Are you sure you want to delete this goal?`,
      message: `This action is irreversible`,
      buttons: [
        {
          text: 'Yes',
          handler: async () => {
            await this.goal.remove(this.id)
            this.router.navigateByUrl(`/a/goals`)
          }
        },
        {
          text: 'No',
          role: 'cancel'
        }
      ]
    }).then(alert => alert.present())
  }

  // async duplicate() {
    // const modal = await this.modalCtrl.create({ component: SelectUserModalComponent })
    // modal.onDidDismiss().then(async res => {
    //   const uid = res.data as string;
    //   if (uid) {

    //     const loading = await this.loadingCtrl.create({
    //       message: `Duplicating goal`,
    //       spinner: 'lines'
    //     })
    //     loading.present()
    
    //     const duplicateGoalFn = httpsCallable(this.functions, 'duplicateGoal');
    //     const { error, result } = await duplicateGoalFn({ goalId: this.id, uid }).then(res => res.data) as { error: string, result: string }
    
    //     if (!!error) {
    //       loading.dismiss();
    //       throw new Error(result)
    //     };
    //     this.router.navigateByUrl(`/a/goals/${result}`);
    //     loading.dismiss();

    //   }
    // })
    // modal.present();
  // }
}
