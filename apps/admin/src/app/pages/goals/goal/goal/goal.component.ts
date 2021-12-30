import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { Functions, httpsCallable } from '@angular/fire/functions';
import { Router } from '@angular/router';
import { AlertController, LoadingController, ModalController } from '@ionic/angular';
import { Goal } from '@strive/goal/goal/+state/goal.firestore';
import { GoalService } from '@strive/goal/goal/+state/goal.service';
import { GoalForm } from '@strive/goal/goal/forms/goal.form';
import { SelectUserModal } from '@strive/ui/select-user/select-user.modal';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Component({
  selector: '[id] strive-goal',
  templateUrl: './goal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GoalComponent implements OnInit {

  goal$: Observable<Goal>
  goalForm = new GoalForm()

  @Input() id: string

  constructor(
    private alertCtrl: AlertController,
    private functions: Functions,
    private goal: GoalService,
    private loadingCtrl: LoadingController,
    private modalCtrl: ModalController,
    private router: Router
  ) {}

  ngOnInit() {
    this.goal$ = this.goal.valueChanges(this.id).pipe(
      tap(goal => this.goalForm.patchValue(goal))
    )
  }

  update() {
    if (this.goalForm.invalid) {
      console.error('invalid form')
      return
    }

    this.goal.update({ ...this.goalForm.value, id: this.id })
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

  finish() {
    this.goal.update(this.id, { status: 'finished' })
  }

  // async duplicate() {
    // const modal = await this.modalCtrl.create({ component: SelectUserModal })
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
