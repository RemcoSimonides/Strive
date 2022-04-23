import { Component, HostBinding, HostListener, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { AlertController, LoadingController, ModalController, NavParams, NavController } from '@ionic/angular';

// Services
import { CollectiveGoalService } from '@strive/collective-goal/collective-goal/+state/collective-goal.service';
import { createTemplate } from '@strive/template/+state/template.firestore';
import { TemplateService } from '@strive/template/+state/template.service';

// Strive
import { TemplateForm } from '@strive/template/forms/template.form';

@Component({
  selector: 'template-upsert-modal',
  templateUrl: './upsert-template-modal.page.html',
  styleUrls: ['./upsert-template-modal.page.scss'],
})
export class UpsertTemplateModalComponent implements OnInit {
  templateId: string
  templateForm: TemplateForm
  collectiveGoalId: string

  newTemplate = true
  nextPage = false

  editorStyle = {
    height: '300px',
    width: '100%'
  }

  editorConfig = {
    toolbar: {
      container: [
        ['bold', 'italic', 'underline'],
        [{'header': 1}, {'header': 2}],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'indent': '-1'}, { 'indent': '+1' }],
        ['link', 'image', 'video'],
        // ['clean']
      ]
    },
    imageDrop: true,
    imageResize: {
      displayStyles: {
        backgroundColor: 'black',
        border: 'none',
        color: 'white'
      },
      modules: [ 'Resize', 'DisplaySize', 'Toolbar' ]
    }
  }
  
  @HostListener('window:popstate', ['$event'])
  onPopState() {
    this.modalCtrl.dismiss()
  }
  @HostBinding() modal: HTMLIonModalElement

  constructor(
    private alertCtrl: AlertController,
    private collectiveGoalService: CollectiveGoalService,
    private loadingCtrl: LoadingController,
    private location: Location,
    private modalCtrl: ModalController,
    private navCtrl: NavController,
    private navParams: NavParams,
    private templateService: TemplateService
  ) {
    window.history.pushState(null, null, window.location.href)
  }

  ngOnInit() {
    this.modal.onWillDismiss().then(res => {
      if (res.role === 'backdrop') this.location.back()
    })

    const { template, collectiveGoalId } = this.navParams.data
    this.collectiveGoalId = collectiveGoalId
    this.templateForm = new TemplateForm(template)
    this.newTemplate = !template
    this.templateId = template ? template.id : this.templateService.createId()
    this.loadingCtrl.getTop().then((v) => v ? this.loadingCtrl.dismiss() : undefined)
  }

  dismiss() {
    this.location.back()
  }

  public async save() {
    if (!this.templateForm.valid) {
      console.log(`invalid value(s)`)
    } else {
      const loading = await this.loadingCtrl.create({
        spinner: 'lines',
        message: this.newTemplate ? 'Creating template...' : 'Updating template...'
      })
      await loading.present()

      try {
        const template = createTemplate({ ...this.templateForm.value, id: this.templateId })
        await this.templateService.upsert(template, { params: {collectiveGoalId: this.collectiveGoalId}})
        if (this.newTemplate) {
          this.navCtrl.navigateForward(`collective-goal/${this.collectiveGoalId}/template/${this.templateId}`)
          this.modalCtrl.dismiss()
        } else {
          this.dismiss()
        }
        loading.dismiss()

      } catch(error) {
        loading.dismiss()
        this.alertCtrl.create({
          message: error.message,
          buttons: ['Ok']
        }).then(alert => alert.present())
      }
    }
  }


  public async openingDatetime($event) {

    // empty value
    $event.target.value = ""

    const collectiveGoal = await this.collectiveGoalService.getValue(this.collectiveGoalId)

    // set min
    $event.target.min = new Date().toISOString()

    // set max
    $event.target.max = collectiveGoal.deadline ? collectiveGoal.deadline : new Date(new Date().getFullYear() + 1000, 12, 31).toISOString()
  }
}
