import { Component, OnInit } from '@angular/core';
//ionic
import { AlertController, LoadingController, ModalController, NavController, NavParams  } from '@ionic/angular'

//Services
import { GoalService } from '@strive/goal/goal/+state/goal.service'
import { CollectiveGoalService } from '@strive/collective-goal/collective-goal/+state/collective-goal.service';

//Interfaces
import { createGoal, Goal, GoalPublicityType } from '@strive/goal/goal/+state/goal.firestore'
import { CollectiveGoal } from '@strive/collective-goal/collective-goal/+state/collective-goal.firestore';
import { GoalForm } from '@strive/goal/goal/forms/goal.form';

@Component({
  selector: 'goal-upsert',
  templateUrl: './upsert.component.html',
  styleUrls: ['./upsert.component.scss']
})
export class UpsertGoalModalComponent implements OnInit {

  private collectiveGoal: CollectiveGoal

  public goalId: string
  public goalForm = new GoalForm()
  public mode: 'update' | 'create'

  constructor(
    private alertCtrl: AlertController,
    private collectiveGoalService: CollectiveGoalService,
    private goalService: GoalService,
    private loadingCtrl: LoadingController,
    private modalCtrl: ModalController,
    private navCtrl: NavController,
    private navParams: NavParams,
  ) { }

  async ngOnInit() {
    const goal = this.navParams.data.currentGoal as Goal
    if (!!goal) {
      this.goalForm.reset(goal)
      this.goalId = goal.id
      this.mode = 'update'
    } else {
      this.mode = 'create'
      this.goalId = this.goalService.createId()
    }

    const collectiveGoalId = this.navParams.data.collectiveGoalId as string
    if (!!collectiveGoalId) {
      this.goalForm.collectiveGoalId.setValue(collectiveGoalId)
      this.collectiveGoal = await this.collectiveGoalService.getValue(collectiveGoalId);
    }

    this.loadingCtrl.getTop().then((v) => v ? this.loadingCtrl.dismiss() : undefined)
  }

  dismiss(){
    this.modalCtrl.dismiss()
  }

  async upsert() {
    if (!this.goalForm.valid){
      console.log('invalid value(s)')
    } else {
    
      const loading = await this.loadingCtrl.create({
        spinner: 'lines',
        message: 'Please wait...'
      })
      loading.present()
      
      try {
        const publicity = this.determinePublicity(this.goalForm.value.isSecret)
        this.goalForm.publicity.setValue(publicity)

        const goal = createGoal({ ...this.goalForm.value, id: this.goalId })
        await this.goalService.upsert(goal);
        if (this.mode === 'create') {
          await this.navCtrl.navigateForward(`/goal/${this.goalId}/edit`, { state: { mode: 'create' }});
        }

        await loading.dismiss()
        await this.modalCtrl.dismiss()

      } catch(error) {
        await loading.dismiss()
        const alert = await this.alertCtrl.create({
          message: error.message,
          buttons: ['Ok']
        })
        await alert.present()
      }
    }
  }

  private determinePublicity(isSecret: boolean): GoalPublicityType {
    if (isSecret) return 'private'
    if (!!this.collectiveGoal && this.collectiveGoal.isSecret) return 'collectiveGoalOnly'
    return 'public'
  }

  public openingDatetime($event) {
    // empty value
    $event.target.value = ""
    
    // set min value to now
    $event.target.min = new Date().toISOString() 

    // set max value
    if (!!this.collectiveGoal) {
      $event.target.max = this.collectiveGoal.deadline ? this.collectiveGoal.deadline : new Date(new Date().getFullYear() + 1000, 12, 31).toISOString()
    } else {
      $event.target.max = new Date(new Date().getFullYear() + 1000, 12, 31).toISOString()
    }

  }

}
