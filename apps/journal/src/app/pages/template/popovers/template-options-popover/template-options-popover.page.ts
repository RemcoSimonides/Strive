import { Component, OnInit } from '@angular/core';
// Ionic
import { PopoverController, NavParams, ModalController } from '@ionic/angular'
import { TemplateService } from '@strive/template/+state/template.service';
import { UpsertTemplateModalComponent } from '@strive/template/modals/upsert/upsert-template-modal.page';

@Component({
  selector: 'journal-template-options-popover',
  templateUrl: './template-options-popover.page.html'
})
export class TemplateOptionsPopoverComponent implements OnInit {

  public isAdmin = false

  constructor(
    private modalCtrl: ModalController,
    private navParams: NavParams,
    private popoverCtrl: PopoverController,
    private service: TemplateService
  ) { }

  ngOnInit() {
    this.isAdmin = this.navParams.data.isAdmin
  }

  async editTemplate() {
    const { collectiveGoalId, templateId } = this.navParams.data
    const template = await this.service.getValue(templateId, { collectiveGoalId })
    this.modalCtrl.create({
      component: UpsertTemplateModalComponent,
      componentProps: { collectiveGoalId, template }
    }).then(modal => modal.present())
    this.popoverCtrl.dismiss()
  }

  // editRoadmap() {
  //   this.router.navigateByUrl(`${this.router.url}/edit`)
  //   this.popoverCtrl.dismiss()
  // }
}
