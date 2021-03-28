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
import { GoalStakeholderService } from '@strive/goal/stakeholder/+state/stakeholder.service';

@Component({
  selector: 'goal-upsert',
  templateUrl: './upsert.component.html',
  styleUrls: ['./upsert.component.scss']
})
export class UpsertGoalModalComponent implements OnInit {

  // update only
  private goal: Goal

  // both update and create
  private collectiveGoal: CollectiveGoal

  public goalForm = new GoalForm()
  public title = 'Create Goal'
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
    this.goal = this.navParams.data.currentGoal as Goal
    if (!!this.goal) {
      this.goalForm = new GoalForm(this.goal)
      this.mode = 'update'
    } else {
      this.mode = 'create'
    }

    const collectiveGoalId = this.navParams.data.collectiveGoalId as string
    if (!!collectiveGoalId) {
      this.goalForm.collectiveGoalId.setValue(collectiveGoalId)
      this.collectiveGoal = await this.collectiveGoalService.getValue(collectiveGoalId);
    }

    this.loadingCtrl.getTop().then((v) => v ? this.loadingCtrl.dismiss() : null)
  }

  public dismiss(){
    this.modalCtrl.dismiss()
  }

  public async upsert() {
    if (!this.goalForm.valid){
      console.log('invalid value(s)')
    } else {
    
      const loading = await this.loadingCtrl.create({
        spinner: 'lines',
        message: 'Please wait...'
      })
      await loading.present()
      
      try {

        // determine publicity
        const publicity = this.determinePublicity(this.goalForm.value.isPublic)
        this.goalForm.publicity.setValue(publicity)

        const goal = createGoal(this.goalForm.value)
        if (this.mode === 'create') {
          const id = await this.goalService.upsert(goal)
          await this.navCtrl.navigateForward(`/goal/${id}`)
        } else if (this.mode === 'update') {
          await this.goalService.update(this.goal.id, this.goalForm.value)
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

  private determinePublicity(goalIsPublic: boolean): GoalPublicityType {
    if (!goalIsPublic) return 'private'
    if (!!this.collectiveGoal && !this.collectiveGoal.isPublic) return 'collectiveGoalOnly'
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
