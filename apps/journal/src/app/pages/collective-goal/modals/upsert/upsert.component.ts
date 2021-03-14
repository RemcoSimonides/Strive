import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
// Ionic
import { AlertController, LoadingController, ModalController, NavParams } from '@ionic/angular';
// Service
import { CollectiveGoalService } from '@strive/collective-goal/collective-goal/+state/collective-goal.service';
import { ImageService } from '@strive/media/+state/image.service';
// Forms
import { CollectiveGoalForm } from '@strive/collective-goal/collective-goal/forms/collective-goal.form';

@Component({
  selector: 'app-upsert-collective-goal',
  templateUrl: './upsert.component.html',
  styleUrls: ['./upsert.component.scss'],
})
export class UpsertCollectiveGoalPage implements OnInit {

  public collectiveGoalId: string
  public collectiveGoalForm: CollectiveGoalForm
  // public chosenPicture: any

  constructor(
    private alertCtrl: AlertController,
    private service: CollectiveGoalService,
    private imageService: ImageService,
    private loadingCtrl: LoadingController,
    private modalCtrl: ModalController,
    private router: Router,
    private navParam: NavParams,
  ) { }

  ngOnInit() {
    this.collectiveGoalId = this.navParam.data.id
    this.collectiveGoalForm = new CollectiveGoalForm(this.navParam.data.data)
    this.loadingCtrl.getTop().then(v => v ? this.loadingCtrl.dismiss() : undefined)
  }

  dismiss(){
    this.modalCtrl.dismiss()
  }

  public async upsertCollectiveGoal() {
    
    if (!this.collectiveGoalForm.valid) {
      this.alertCtrl.create({
        message: 'Please check the entered values',
        buttons: ['Ok']
      }).then(alert => alert.present())
    }

    if (!this.collectiveGoalForm.dirty) return;

    const loading = await this.loadingCtrl.create({
      spinner: 'lines',
      message: 'Please wait...'
    })
    await loading.present()

    try {
      if (this.collectiveGoalId) {
        this.service.updateCollectiveGoal(this.collectiveGoalId, this.collectiveGoalForm.value);
      } else {
        const id = await this.service.createCollectiveGoal(this.collectiveGoalForm.value);
        await this.router.navigateByUrl(`/collective-goal/${id}`)
      }

      await loading.dismiss();
      await this.modalCtrl.dismiss();

    } catch(error) {
      await loading.dismiss();
      this.alertCtrl.create({
        message: error.message,
        buttons: ['Ok']
      }).then(alert => alert.present())
    }
  }

  public async openDatetime($event): Promise<void> {
    // empty value
    $event.target.value = ""
    // set min
    $event.target.min = new Date().toISOString()
    // set max
    $event.target.max = new Date(new Date().getFullYear() + 1000, 12, 31).toISOString()
  }
}
