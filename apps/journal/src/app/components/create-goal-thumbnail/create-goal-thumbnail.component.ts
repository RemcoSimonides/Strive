import { Component, OnInit, Input } from '@angular/core';
// Ionic
import { ModalController, LoadingController, Platform } from '@ionic/angular';
// Pages
import { UpsertCollectiveGoalPage } from '../../pages/collective-goal/modals/upsert/upsert.component'
import { CreateGoalPage } from '../../pages/goal/modals/create-goal/create-goal.page'
import { CreateTemplateModalPage } from 'apps/journal/src/app/pages/template/modals/create-template-modal/create-template-modal.page';

@Component({
  selector: 'app-create-goal-thumbnail',
  templateUrl: './create-goal-thumbnail.component.html',
  styleUrls: ['./create-goal-thumbnail.component.scss'],
})
export class CreateGoalThumbnailComponent implements OnInit {

  public _title: string

  @Input() limitReached: boolean
  @Input() isCollectiveGoal: boolean
  // template
  @Input() isTemplate: boolean
  // template + goal from collective goal  
  @Input() collectiveGoalId: string

  constructor(
    private loadingCtrl: LoadingController,
    private modalCtrl: ModalController,
    public _platform: Platform
  ) { }

  ngOnInit() {

    if (this.isCollectiveGoal) {
      this._title = "NEW COLLECTIVE GOAL"
    } else if (this.isTemplate) {
      this._title = "NEW TEMPLATE"
    } else  {
      this._title = "NEW GOAL"
    }

  }

  async navToCreateGoal() {

    const loading: HTMLIonLoadingElement = await this.loadingCtrl.create({
      spinner: 'lines',
    })
    await loading.present()

    if (this.isCollectiveGoal) {

        const modal = await this.modalCtrl.create({
          component: UpsertCollectiveGoalPage
        })
        await modal.present()

    } else if (this.isTemplate) {

      const modal = await this.modalCtrl.create({
        component: CreateTemplateModalPage,
        componentProps: {
          collectiveGoalId: this.collectiveGoalId
        }
      })
      await modal.present()

    } else {
    
        const modal = await this.modalCtrl.create({
          component: CreateGoalPage,
          componentProps: {
            collectiveGoalId: this.collectiveGoalId
          }
        })
        await modal.present()

    }

  }

}
