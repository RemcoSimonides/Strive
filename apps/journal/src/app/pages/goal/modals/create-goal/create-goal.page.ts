import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms'
//ionic
import { AlertController, LoadingController, ModalController, NavController, NavParams  } from '@ionic/angular'

//Services
import { GoalService, collectiveGoalArgs } from '@strive/goal/goal/+state/goal.service'
import { CollectiveGoalService } from '@strive/collective-goal/collective-goal/+state/collective-goal.service';
import { UserService } from '@strive/user/user/+state/user.service';

//Interfaces
import { Goal, GoalPublicityType } from '@strive/goal/goal/+state/goal.firestore'
import { ICollectiveGoal } from '@strive/collective-goal/collective-goal/+state/collective-goal.firestore';

@Component({
  selector: 'app-create-goal',
  templateUrl: './create-goal.page.html',
  styleUrls: ['./create-goal.page.scss'],
})
export class CreateGoalPage implements OnInit {

  public createGoalForm: FormGroup
  public title: string = 'Create Goal'

  private _collectiveGoalId: string | undefined
  private _collectiveGoal: ICollectiveGoal

  public goal = <Goal>{}

  constructor(
    private user: UserService,
    private alertCtrl: AlertController,
    private collectiveGoalService: CollectiveGoalService,
    private formBuilder: FormBuilder,
    private goalService: GoalService,
    private loadingCtrl: LoadingController,
    private modalCtrl: ModalController,
    private navCtrl: NavController,
    private navParams: NavParams,
  ) { }

  async ngOnInit() {

    //Initialising create goal form
    this.createGoalForm = this.formBuilder.group({
      title: ['', Validators.compose([Validators.required])],
      shortDescription: [''],
      isPublic: [false, Validators.compose([Validators.required])],
      deadline: ['']
    })

    if (this.navParams.data.currentGoal) {
      this.goal = this.navParams.data.currentGoal
      this.title = 'Edit Goal'
      this._collectiveGoalId = this.goal.collectiveGoal ? this.goal.collectiveGoal.id : undefined

      this.createGoalForm.patchValue({
        title: this.goal.title,
        shortDescription: this.goal.shortDescription,
        isPublic: this.goal.publicity === 'private' ? false : true,
        deadline: this.goal.deadline
      })
    }

    this._collectiveGoalId = this.navParams.data.collectiveGoalId
    if (this._collectiveGoalId) this._collectiveGoal = await this.collectiveGoalService.getCollectiveGoal(this._collectiveGoalId)

    this.loadingCtrl.getTop().then((v) => v ? this.loadingCtrl.dismiss() : null)

  }

  public async dismiss(){
    await this.modalCtrl.dismiss()
  }

  public async handleCreatingGoal(){

    if (!this.createGoalForm.valid){
      console.log('invalid value(s)')
    } else {

      const loading = await this.loadingCtrl.create({
        spinner: 'lines',
        message: 'Please wait...'
      })
      await loading.present()

      try {

        const goal: Partial<Goal> = {
          title: this.createGoalForm.value.title,
          shortDescription: this.createGoalForm.value.shortDescription,
          publicity: this.determinePublicity(this.createGoalForm.value.isPublic, this.navParams.data.collectiveGoalIsPublic !== undefined ? this.navParams.data.collectiveGoalIsPublic : undefined),
          deadline: this.createGoalForm.value.deadline ? this.createGoalForm.value.deadline : null
        }

        const collectiveGoal: collectiveGoalArgs = {
          id: this._collectiveGoal ? this._collectiveGoal.id : null,
          title: this._collectiveGoal ? this._collectiveGoal.title : null,
          isPublic: this._collectiveGoal ? this._collectiveGoal.isPublic : null,
          deadline: this._collectiveGoal ? this._collectiveGoal.deadline : null,
          image: this._collectiveGoal ? this._collectiveGoal.image : null
        }

        const profile = await this.user.getProfile()
        const newGoalId = await this.goalService.handleCreatingGoal(profile.id, goal, collectiveGoal)

        await loading.dismiss()
        await this.modalCtrl.dismiss()
        await this.navCtrl.navigateForward(`/goal/${newGoalId}`)

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

  public async handleUpdatingGoal(): Promise<void> {

    if (!this.createGoalForm.valid) {
      console.log('invalid value(s)')
    } else {

      const loading = await this.loadingCtrl.create({
        spinner: 'lines',
        message: 'Updating goal...'
      })
      await loading.present()

      try {

        this.goal.title = this.createGoalForm.value.title
        this.goal.shortDescription = this.createGoalForm.value.shortDescription
        this.goal.publicity = this.determinePublicity(this.createGoalForm.value.isPublic, this.goal.collectiveGoal ? this.goal.collectiveGoal.isPublic : undefined)
        this.goal.deadline = this.createGoalForm.value.deadline ? this.createGoalForm.value.deadline : null
        
        // image
        await this.goalService.handleUpdatingGoal(this.goal)

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

  private determinePublicity(goalIsPublic: boolean, collectiveGoalIsPublic?: boolean): GoalPublicityType {
    if (!goalIsPublic) {
      return 'private'
    } else if (collectiveGoalIsPublic !== undefined) {
      if (collectiveGoalIsPublic) {
        return 'public'
      } else {
        return 'collectiveGoalOnly'
      }
    } else {
      return 'public'
    }
  }

  public async _openingDatetime($event): Promise<void> {

    // empty value
    $event.target.value = ""
    
    // set min value to now
    $event.target.min = new Date().toISOString() 

    // set max value
    if (this._collectiveGoal) {
      $event.target.max = this._collectiveGoal.deadline ? this._collectiveGoal.deadline : new Date(new Date().getFullYear() + 1000, 12, 31).toISOString()
    } else {
      $event.target.max = new Date(new Date().getFullYear() + 1000, 12, 31).toISOString()
    }

  }

}
