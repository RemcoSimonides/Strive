import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
// Ionic
import { PopoverController, NavParams, ModalController } from '@ionic/angular'
import { TemplateService } from '@strive/template/+state/template.service';
import { UpsertTemplateModalPage } from '../../modals/upsert-template-modal/upsert-template-modal.page';

@Component({
  selector: 'app-template-options-popover',
  templateUrl: './template-options-popover.page.html'
})
export class TemplateOptionsPopoverPage implements OnInit {

  public isAdmin = false

  constructor(
    private modalCtrl: ModalController,
    private navParams: NavParams,
    private popoverCtrl: PopoverController,
    private router: Router,
    private service: TemplateService
  ) { }

  ngOnInit() {
    this.isAdmin = this.navParams.data.isAdmin
  }

  async editTemplate() {
    const { collectiveGoalId, templateId } = this.navParams.data
    const template = await this.service.getTemplate(collectiveGoalId, templateId)
    this.modalCtrl.create({
      component: UpsertTemplateModalPage,
      componentProps: { collectiveGoalId, template }
    }).then(modal => modal.present())
    this.popoverCtrl.dismiss()
  }

  editRoadmap() {
    this.router.navigateByUrl(`${this.router.url}/edit`)
    this.popoverCtrl.dismiss()
  }
}
