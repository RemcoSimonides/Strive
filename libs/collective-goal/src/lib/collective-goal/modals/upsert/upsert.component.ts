import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
// Ionic
import { AlertController, LoadingController, ModalController, NavParams } from '@ionic/angular';
// Service
import { CollectiveGoalService } from '@strive/collective-goal/collective-goal/+state/collective-goal.service';
// Forms
import { CollectiveGoalForm } from '@strive/collective-goal/collective-goal/forms/collective-goal.form';
import { createCollectiveGoal } from '@strive/collective-goal/collective-goal/+state/collective-goal.firestore';

@Component({
  selector: 'app-upsert-collective-goal',
  templateUrl: './upsert.component.html',
  styleUrls: ['./upsert.component.scss'],
})
export class UpsertCollectiveGoalPage implements OnInit {
  @HostListener('window:popstate', ['$event'])
  onPopState() {
    this.modalCtrl.dismiss()
  }

  collectiveGoalId: string
  collectiveGoalForm: CollectiveGoalForm
  
  state: 'create' | 'update'

  constructor(
    private alertCtrl: AlertController,
    private service: CollectiveGoalService,
    private loadingCtrl: LoadingController,
    private location: Location,
    private modalCtrl: ModalController,
    private router: Router,
    private navParam: NavParams,
  ) {
    window.history.pushState(null, null, window.location.href)
    this.modalCtrl.getTop().then(modal => {
      modal.onWillDismiss().then(res => {
        if (res.role === 'backdrop') this.location.back()
      })
    })
  }

  ngOnInit() {
    this.collectiveGoalId = this.navParam.data.id
    this.state = !!this.collectiveGoalId ? 'update' : 'create'
    if (!this.collectiveGoalId) this.collectiveGoalId = this.service.createId();
    this.collectiveGoalForm = new CollectiveGoalForm(this.navParam.data.data)
    this.loadingCtrl.getTop().then(v => v ? this.loadingCtrl.dismiss() : undefined)
  }

  dismiss(){
    this.location.back()
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
    loading.present()

    try {
      const collectiveGoal = createCollectiveGoal({
        ...this.collectiveGoalForm.value,
        id: this.collectiveGoalId
      })
      this.service.upsert(collectiveGoal);
      if (this.state === 'create') {
        this.router.navigateByUrl(`/collective-goal/${this.collectiveGoalId}`)
        this.modalCtrl.dismiss()
      } else {
        this.dismiss()
      }

      loading.dismiss();

    } catch(error) {
      loading.dismiss();
      this.alertCtrl.create({
        message: error.message,
        buttons: ['Ok']
      }).then(alert => alert.present())
    }
  }

  openDatetime($event) {
    // empty value
    $event.target.value = ""
    // set min
    $event.target.min = new Date().toISOString()
    // set max
    $event.target.max = new Date(new Date().getFullYear() + 1000, 12, 31).toISOString()
  }
}
