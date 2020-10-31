import { Component, Input } from '@angular/core';
// Ionic
import { ModalController, Platform } from '@ionic/angular';
// Pages
import { UpsertCollectiveGoalPage } from 'apps/journal/src/app/pages/collective-goal/modals/upsert/upsert.component';
import { CreateGoalPage } from 'apps/journal/src/app/pages/goal/modals/create-goal/create-goal.page';
import { CreateTemplateModalPage } from 'apps/journal/src/app/pages/template/modals/create-template-modal/create-template-modal.page';

@Component({
  selector: '[type]app-create-thumbnail',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss'],
})
export class CreateThumbnailComponent {

  @Input() set type(t: 'collectiveGoal' | 'goal' | 'template') {
    this._type = t;
    switch (t) {
      case 'collectiveGoal':
        this._title = "NEW COLLECTIVE GOAL"
        break;
    
      case 'goal':
        this._title = "NEW GOAL"
        break;

      case 'template':
        this._title = "NEW TEMPLATE"
        break;

      default:
        break;
    }
  };
  @Input() collectiveGoalId: string;
  @Input() limitReached: boolean = false;

  public _title: string;
  public _type: string;

  constructor(
    private modalCtrl: ModalController,
    public _platform: Platform
  ) { }

  async create() {
    let modal;
    switch (this._type) {
      case 'collectiveGoal':
        modal = await this.modalCtrl.create({
          component: UpsertCollectiveGoalPage
        })
        break;
      
      case 'goal':
        modal = await this.modalCtrl.create({
          component: CreateGoalPage,
          componentProps: {
            collectiveGoalId: this.collectiveGoalId
          }
        })
        break;
      
      case 'template':
        modal = await this.modalCtrl.create({
          component: CreateTemplateModalPage,
          componentProps: {
            collectiveGoalId: this.collectiveGoalId
          }
        })
        break;
    
      default:
        throw new Error("Unknown type of thumbnail");        
    }
    await modal.present()
  }
}
