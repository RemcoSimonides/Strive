import { Component, Input } from '@angular/core';
// Ionic
import { ModalController, Platform } from '@ionic/angular';
// Pages
import { UpsertCollectiveGoalPage } from 'apps/journal/src/app/pages/collective-goal/modals/upsert/upsert.component';
import { UpsertGoalModalComponent } from '@strive/goal/goal/components/upsert/upsert.component';
import { UpsertTemplateModalPage } from 'apps/journal/src/app/pages/template/modals/upsert-template-modal/upsert-template-modal.page';

type Type = 'collectiveGoal' | 'goal' | 'template'

@Component({
  selector: '[type] strive-create-thumbnail',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss'],
})
export class CreateThumbnailComponent {

  title = { collectiveGoal: 'NEW COLLECTIVE GOAL', goal: 'NEW GOAL', template: 'NEW TEMPLATE' }

  @Input() type: Type
  @Input() collectiveGoalId: string
  @Input() limitReached: boolean = false

  constructor(
    private modalCtrl: ModalController,
    public platform: Platform
  ) { }

  async create() {
    let modal: HTMLIonModalElement
    switch (this.type) {
      case 'collectiveGoal':
        modal = await this.modalCtrl.create({ component: UpsertCollectiveGoalPage })
        break;
      
      case 'goal':
        modal = await this.modalCtrl.create({
          component: UpsertGoalModalComponent,
          componentProps: {
            collectiveGoalId: this.collectiveGoalId
          }
        })
        break;
      
      case 'template':
        modal = await this.modalCtrl.create({
          component: UpsertTemplateModalPage,
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
