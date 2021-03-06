import { Component, OnInit } from '@angular/core';
import { AlertController, LoadingController, ModalController, NavParams, NavController } from '@ionic/angular';

// Services
import { CollectiveGoalService } from '@strive/collective-goal/collective-goal/+state/collective-goal.service';
import { createTemplate } from '@strive/template/+state/template.firestore';
import { TemplateService } from '@strive/template/+state/template.service';

// Strive
import { TemplateForm } from '@strive/template/forms/template.form';

@Component({
  selector: 'app-upsert-template-modal',
  templateUrl: './upsert-template-modal.page.html',
  styleUrls: ['./upsert-template-modal.page.scss'],
})
export class UpsertTemplateModalPage implements OnInit {

  public templateId: string
  public templateForm: TemplateForm
  public collectiveGoalId: string

  public newTemplate = true
  public nextPage = false

  public editorStyle = {
    height: '300px',
    width: '100%'
  }

  public editorConfig = {
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

  constructor(
    private alertCtrl: AlertController,
    private collectiveGoalService: CollectiveGoalService,
    private loadingCtrl: LoadingController,
    private modalCtrl: ModalController,
    private navCtrl: NavController,
    private navParams: NavParams,
    private templateService: TemplateService
  ) { }

  ngOnInit() {
    const { template, collectiveGoalId } = this.navParams.data
    this.collectiveGoalId = collectiveGoalId
    this.templateForm = new TemplateForm(template)
    this.newTemplate = !template
    this.templateId = !!template ? template.id : this.templateService.db.createId()
    this.loadingCtrl.getTop().then((v) => v ? this.loadingCtrl.dismiss() : undefined)
  }

  dismiss() {
    this.modalCtrl.dismiss()
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
        if (this.newTemplate) this.navCtrl.navigateForward(`collective-goal/${this.collectiveGoalId}/template/${this.templateId}`)

        loading.dismiss()
        this.modalCtrl.dismiss()

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
