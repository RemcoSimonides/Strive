import { Component, OnInit } from '@angular/core';
// Ionic
import { PopoverController, NavParams } from '@ionic/angular'

@Component({
  selector: 'app-template-options-popover',
  templateUrl: './template-options-popover.page.html',
  styleUrls: ['./template-options-popover.page.scss'],
})
export class TemplateOptionsPopoverPage implements OnInit {

  public enumTemplateOptions = enumTemplateOptions
  public _isAdmin: boolean = false

  constructor(
    private navParams: NavParams,
    private popoverCtrl: PopoverController
  ) { }

  ngOnInit() {
    this._isAdmin = this.navParams.data.isAdmin
  }

  async close(enumTemplateOptions: enumTemplateOptions) {
    this.popoverCtrl.dismiss(enumTemplateOptions)
  }

}

export enum enumTemplateOptions {
  editTemplate,
  editRoadmap
}