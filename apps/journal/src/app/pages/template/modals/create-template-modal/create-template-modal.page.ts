import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AlertController, LoadingController, ModalController, NavParams, NavController } from '@ionic/angular';

// Services
import { CollectiveGoalService } from '@strive/collective-goal/collective-goal/+state/collective-goal.service';
import { ImageService } from '@strive/media/+state/image.service';
import { TemplateService } from '@strive/template/+state/template.service';

// Interfaces
import { ITemplate } from '@strive/interfaces';
import { ICollectiveGoal } from '@strive/collective-goal/collective-goal/+state/collective-goal.firestore';

@Component({
  selector: 'app-create-template-modal',
  templateUrl: './create-template-modal.page.html',
  styleUrls: ['./create-template-modal.page.scss'],
})
export class CreateTemplateModalPage implements OnInit {

  private _collectiveGoalId: string

  public createTemplateForm: FormGroup

  public template = <ITemplate>{}

  public _modalTitle: string = `Create template`
  public _templateIsNew: boolean = true

  public _nextPage: boolean = false
  public _description: string = ''

  public _editorStyle = {
    height: '300px',
    width: '100%'
  }

  public _editorConfig = {
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
    private formBuilder: FormBuilder,
    private imageService: ImageService,
    private loadingCtrl: LoadingController,
    private modalCtrl: ModalController,
    private navCtrl: NavController,
    private navParams: NavParams,
    private templateService: TemplateService
  ) { }

  ngOnInit() {

    this._collectiveGoalId = this.navParams.data.collectiveGoalId

    // Initialising create template form
    this.createTemplateForm = this.formBuilder.group({
      title: ['', Validators.compose([Validators.required])],
      goalTitle: ['', Validators.compose([Validators.required])],
      goalShortDescription: [''],
      goalDescription: [''],
      goalIsPublic: [false],
      goalDeadline: ['']
    })

    if (this.navParams.data.currentTemplate) {
      this._templateIsNew = false
      this._modalTitle = `Edit template`
      this.template = this.navParams.data.currentTemplate

      this.createTemplateForm.patchValue({
        title: this.template.title,
        goalTitle: this.template.goalTitle,
        goalShortDescription: this.template.goalShortDescription,
        goalIsPublic: this.template.goalIsPublic,
        goalDeadline: this.template.goalDeadline
      })
      this._description = this.template.description
    }

    this.loadingCtrl.getTop().then((v) => v ? this.loadingCtrl.dismiss() : null)

  }

  nextPage() {
    this._nextPage = !this._nextPage
  }

  onEnter(event: KeyboardEvent) {
    if (!this._nextPage) {
      this.nextPage()
    }
  }

  async dismiss() {
    await this.modalCtrl.dismiss()
  }

  public async handleCreatingTemplate(): Promise<void> {

    if (!this.createTemplateForm.valid) {
      console.log('invalid value(s)')
    } else {

      const loading = await this.loadingCtrl.create({
        spinner: 'lines',
        message: this._templateIsNew ? `Creating template...` : `Updating template...`
      })
      await loading.present()

      try {

        let id: string

        this.fillTemplateWithDataFromForm()

        id = await this.templateService.createTemplate(this._collectiveGoalId, this.template)

        await loading.dismiss()
        await this.modalCtrl.dismiss()
        await this.navCtrl.navigateForward(`collective-goal/${this._collectiveGoalId}/template/${id}`)


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

  public async handleUpdatingTemplate(): Promise<void> {

    if (!this.createTemplateForm.valid) {
      console.log(`invalid value(s)`)
    } else {

      const loading = await this.loadingCtrl.create({
        spinner: 'lines',
        message: `Updating template...`
      })
      await loading.present()

      try {

        if (this.formHasChanged()) {

          this.fillTemplateWithDataFromForm()

          await this.templateService.updateTemplate(this._collectiveGoalId,  this.template)

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

  private formHasChanged(): boolean {

    if (this.template.title !== this.createTemplateForm.value.title) return true
    if (this.template.description !== this._description) return true
    if (this.template.goalTitle !== this.createTemplateForm.value.goalTitle) return true
    if (this.template.goalShortDescription !== this.createTemplateForm.value.goalShortDescription) return true
    if (this.template.goalIsPublic !== this.createTemplateForm.value.goalIsPublic) return true
    if (this.template.goalDeadline !== this.createTemplateForm.value.goalDeadline) return true
    if (this.imageService.image) return true

    return false

  }

  private fillTemplateWithDataFromForm() {

    this.template.title = this.createTemplateForm.value.title
    this.template.description = this._description
    this.template.goalTitle = this.createTemplateForm.value.goalTitle
    this.template.goalShortDescription = this.createTemplateForm.value.goalShortDescription
    this.template.goalIsPublic = this.createTemplateForm.value.goalIsPublic
    this.template.goalImage = this.createTemplateForm.value.goalImage
    this.template.goalDeadline  = this.createTemplateForm.value.goalDeadline

  }

  public async _openingDatetime($event): Promise<void> {

    // empty value
    $event.target.value = ""

    const collectiveGoal: ICollectiveGoal = await this.collectiveGoalService.getCollectiveGoal(this._collectiveGoalId)

    // set min
    $event.target.min = new Date().toISOString()

    // set max
    $event.target.max = collectiveGoal.deadline ? collectiveGoal.deadline : new Date(new Date().getFullYear() + 1000, 12, 31).toISOString()

  }

}
