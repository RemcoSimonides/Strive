import { Component, HostListener, Inject, OnInit } from '@angular/core';
import { Location } from '@angular/common';
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
  @HostListener('window:popstate', ['$event'])
  onPopState() {
    this.modalCtrl.dismiss()
  }

  private collectiveGoal: CollectiveGoal

  public goalId: string
  public goalForm: GoalForm
  public mode: 'update' | 'create'

  constructor(
    @Inject('APP_NAME') private appName: string,
    private alertCtrl: AlertController,
    private collectiveGoalService: CollectiveGoalService,
    private goalService: GoalService,
    private loadingCtrl: LoadingController,
    private location: Location,
    private modalCtrl: ModalController,
    private navCtrl: NavController,
    private navParams: NavParams,
  ) {
    const goal = this.navParams.data.currentGoal as Goal
    if (goal) {
      this.mode = 'update'
      this.goalForm = new GoalForm(goal)
      this.goalId = goal.id
    } else {
      this.mode = 'create'
      this.goalForm = new GoalForm()
      this.goalId = this.goalService.createId()
    }

    this.loadingCtrl.getTop().then((v) => v ? this.loadingCtrl.dismiss() : undefined)

    window.history.pushState(null, null, window.location.href)
    this.modalCtrl.getTop().then(modal => {
      modal.onWillDismiss().then(res => {
        if (res.role === 'backdrop') this.location.back()
      })
    })
  }

  async ngOnInit() {
    const collectiveGoalId = this.navParams.data.collectiveGoalId as string
    if (collectiveGoalId) {
      this.goalForm.collectiveGoalId.setValue(collectiveGoalId)
      this.collectiveGoal = await this.collectiveGoalService.getValue(collectiveGoalId);
    }
  }

  dismiss(){
    this.location.back()
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
        delete goal['isSecret'] // remove isSecret value from Form
        await this.goalService.upsert(goal, { params: { uid: this.navParams.data?.uid }})
        if (this.mode === 'create') {
          if (this.appName === 'journal') {
            await this.navCtrl.navigateForward(`/goal/${this.goalId}/edit`, { state: { mode: 'create' }});
          } else if (this.appName === 'admin') {
            await this.navCtrl.navigateForward(`/a/goals/${this.goalId}`)
          }
          this.modalCtrl.dismiss()
        } else {
          this.dismiss()
        }

        await loading.dismiss()

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
    if (this.collectiveGoal?.isSecret) return 'collectiveGoalOnly'
    return 'public'
  }

  openingDatetime($event) {
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
