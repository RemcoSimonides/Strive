import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
// Ionic
import { AlertController, LoadingController, ModalController, NavParams } from '@ionic/angular';
// Interface
import { ICollectiveGoal } from 'apps/journal/src/app/interfaces/collective-goal.interface';
// Service
import { CollectiveGoalService } from 'apps/journal/src/app/services/collective-goal/collective-goal.service';
import { ImageService } from 'apps/journal/src/app/services/image/image.service';

@Component({
  selector: 'app-create-collective-goal',
  templateUrl: './create-collective-goal.page.html',
  styleUrls: ['./create-collective-goal.page.scss'],
})
export class CreateCollectiveGoalPage implements OnInit {

  public createCollectiveGoalForm: FormGroup
  public chosenPicture: any
  public collectiveGoal = <ICollectiveGoal>{}

  constructor(
    private alertCtrl: AlertController,
    private collectiveGoalService: CollectiveGoalService,
    private formBuilder: FormBuilder,
    private imageService: ImageService,
    private loadingCtrl: LoadingController,
    private modalCtrl: ModalController,
    private router: Router,
    private navParam: NavParams,
  ) { }

  ngOnInit() {

    // Initialising create collectivegoal form
    this.createCollectiveGoalForm = this.formBuilder.group({
      title: ['', Validators.compose([Validators.required])],
      shortDescription: [''],
      description: [''],
      isPublic: [false, Validators.compose([Validators.required])],
      deadline: ['']
    })

    if (this.navParam.data.id) {
      this.collectiveGoal = this.navParam.data.data
      this.collectiveGoal.id = this.navParam.data.id

      this.createCollectiveGoalForm.patchValue({
        title: this.collectiveGoal.title,
        shortDescription:  this.collectiveGoal.shortDescription,
        description: this.collectiveGoal.description,
        isPublic: this.collectiveGoal.isPublic,
        deadline:  this.collectiveGoal.deadline
      })
    }

    this.loadingCtrl.getTop().then((v) => v ? this.loadingCtrl.dismiss() : null)

  }

  async dismiss(){
    await this.modalCtrl.dismiss()
  }

  /**
   * Check form
   * Creates Collective goal
   * Adds user as stakeholder to the collective goal
   * Adds collective goal to users' attending collective goals
   * Navigates user to the page of the created collective goal
   */
  public async handleCreatingCollectiveGoal(): Promise<void>{

    if (!this.createCollectiveGoalForm.valid){
      console.log('invalid value(s)')
    } else {
      
      const loading =  await this.loadingCtrl.create({
        spinner: 'lines',
        message: 'Please wait...'
      })

      await loading.present()
      
      try {

        //init collectiveGoal object
        let collectiveGoal = <ICollectiveGoal>{}
        let id: string

        //fill collectiveGoal with data from form
        collectiveGoal = this.fillCollectiveGoalWithDataFromForm(collectiveGoal)
        
        //without image
        id = await this.collectiveGoalService.handleCreatingCollectiveGoal(collectiveGoal)

        await loading.dismiss()
        await this.modalCtrl.dismiss()
        await this.router.navigateByUrl(`/collective-goal/${id}`)
        
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

  public async handleUpdatingCollectiveGoal(): Promise<void> {

    if (!this.createCollectiveGoalForm.valid) {
      console.log('invalid value(s)')
    } else {
      
      const loading = await this.loadingCtrl.create({
        spinner: 'lines',
        message: 'Please wait...'
      })
      await loading.present()

      try {

        if (this.formHasChanged()) {
          
          //Update original collective goal object with new data
          this.collectiveGoal = this.fillCollectiveGoalWithDataFromForm(this.collectiveGoal)

          //without image
          await this.collectiveGoalService.handleUpdatingCollectiveGoal(this.collectiveGoal)

        }

        await loading.dismiss()
        await this.modalCtrl.dismiss()

      } catch(error) {
        await loading.dismiss()

        const alert = await this.alertCtrl.create({
          message: error.message,
          buttons: ['Ok']
        })
        await alert.present(

        )
      }
    }
  }

  private formHasChanged(): boolean {

    if (this.createCollectiveGoalForm.value.title !== this.collectiveGoal.title) return true
    if (this.createCollectiveGoalForm.value.shortDescription !== this.collectiveGoal.shortDescription) return true
    if (this.createCollectiveGoalForm.value.description !== this.collectiveGoal.description) return true
    if (this.createCollectiveGoalForm.value.isPublic !== this.collectiveGoal.isPublic) return true
    if (this.createCollectiveGoalForm.value.deadline !== this.collectiveGoal.deadline) return true
    if (this.imageService.image) return true

    return false

  }

  private fillCollectiveGoalWithDataFromForm(collectiveGoal: ICollectiveGoal): ICollectiveGoal {

    collectiveGoal.title = this.createCollectiveGoalForm.value.title
    collectiveGoal.shortDescription = this.createCollectiveGoalForm.value.shortDescription
    collectiveGoal.description = this.createCollectiveGoalForm.value.description
    collectiveGoal.isPublic = this.createCollectiveGoalForm.value.isPublic
    collectiveGoal.deadline = this.createCollectiveGoalForm.value.deadline

    return collectiveGoal

  }

  public async _openingDatetime($event): Promise<void> {

    // empty value
    $event.target.value = ""

    // set min
    $event.target.min = new Date().toISOString()

    // set max
    $event.target.max = new Date(new Date().getFullYear() + 1000, 12, 31).toISOString()

  }

}
