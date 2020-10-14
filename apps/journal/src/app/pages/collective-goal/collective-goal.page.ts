import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
// Ionic
import { ModalController, PopoverController, AlertController, NavController, Platform } from '@ionic/angular';
// Rxjs
import { Observable, empty, Subscription, of } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';
// Modals
import { CreateCollectiveGoalPage } from './modals/create-collective-goal/create-collective-goal.page'
import { CreateGoalPage } from '../goal/modals/create-goal/create-goal.page'
// Popovers
import { CollectiveGoalOptionsPage, enumCollectiveGoalOptions } from './popovers/collective-goal-options/collective-goal-options.page'
import { CollectiveGoalSharePopoverPage } from './popovers/collective-goal-share-popover/collective-goal-share-popover.page';
// Services
import { FirestoreService } from 'apps/journal/src/app/services/firestore/firestore.service';
import { CollectiveGoalStakeholderService } from 'apps/journal/src/app/services/collective-goal/collective-goal-stakeholder.service';
import { CollectiveGoalService } from 'apps/journal/src/app/services/collective-goal/collective-goal.service';
import { InviteTokenService } from 'apps/journal/src/app/services/invite-token/invite-token.service';
import { CollectiveGoalAuthGuardService } from 'apps/journal/src/app/services/collective-goal/collective-goal-auth-guard.service';
import { SeoService } from 'apps/journal/src/app/services/seo/seo.service';
import { UserService } from '@strive/user/user/+state/user.service';
// Interfaces
import {
  ICollectiveGoal,
  ICollectiveGoalStakeholder,
  IGoal,
  enumGoalPublicity,
  ITemplate,
  IGoalStakeholder
} from '@strive/interfaces';
// Others
import { goalSlideOptions } from '../../../theme/goal-slide-options'

import { Plugins } from '@capacitor/core';
const { Share } = Plugins;

@Component({
  selector: 'app-collective-goal',
  templateUrl: './collective-goal.page.html',
  styleUrls: ['./collective-goal.page.scss'],
})
export class CollectiveGoalPage implements OnInit {
  public _pageIsLoading: boolean
  private _backBtnSubscription: Subscription

  public _goalSlideOptions = goalSlideOptions
  public enumGoalPublicity = enumGoalPublicity
  public _collectiveGoalExistsAndUserHasAccess: boolean

  collectiveGoalId: string
  collectiveGoalDocObs: Observable<ICollectiveGoal>
  _collectiveGoal: ICollectiveGoal
  templateColObs: Observable<ITemplate[]>
  goalColObs: Observable<IGoal[]>
  _finishedColObs: Observable<IGoal[]>
  stakeholderColObs: Observable<ICollectiveGoalStakeholder[]>

  _isAdmin: boolean = false
  _isAchiever: boolean = false
  _isSpectator: boolean = false

  constructor(
    private alertCtrl: AlertController,
    public user: UserService,
    private collectiveGoalAuthGuardService: CollectiveGoalAuthGuardService,
    private collectiveGoalService: CollectiveGoalService,
    private collectiveGoalStakeholderService: CollectiveGoalStakeholderService,
    private db: FirestoreService,
    private inviteTokenService: InviteTokenService,
    private modalCtrl: ModalController,
    private navCtrl: NavController,
    public _platform: Platform,
    private popoverCtrl: PopoverController,
    private route: ActivatedRoute,
    private _seo: SeoService,
  ) { }

  async ngOnInit() {
    this._pageIsLoading = true

    //Get collective goal id from URL
    this.collectiveGoalId = this.route.snapshot.paramMap.get('id')

    //Get collective goal data
    this.collectiveGoalDocObs = this.collectiveGoalService.getCollectiveGoalDocObs(this.collectiveGoalId)
    this._collectiveGoal = await this.collectiveGoalService.getCollectiveGoal(this.collectiveGoalId)
    if (!this._collectiveGoal.title) {
      this.initNoAccess()
      return
    }

    //Get current users' rights
    // TODO needs test and refactor
    this.user.profile$.pipe(
      switchMap(profile => {
        if (!!profile) {
          return this.collectiveGoalStakeholderService.getStakeholderDocObs(this.user.uid, this.collectiveGoalId)
        } else {
          return of()
        }
      }),
    ).subscribe(async (stakeholder: ICollectiveGoalStakeholder | undefined) => {
      if (!!stakeholder) {

        this._isAchiever = stakeholder.isAchiever
        this._isAdmin = stakeholder.isAdmin
        this._isSpectator = stakeholder.isSpectator

        const access = await this.collectiveGoalAuthGuardService.checkAccess(this._collectiveGoal, stakeholder)
        if (!access) {
          // check invite token
          this.route.queryParams.subscribe(data => {
            if (data.invite_token) {

              const access = this.inviteTokenService.checkInviteTokenOfCollectiveGoal(this.collectiveGoalId, data.invite_token)
              access ? this.initCollectiveGoal() : this.initNoAccess()

            } else {
              this.initNoAccess()
            }
          })
        } else {
          this.initCollectiveGoal()
        }

      } else {

        this._isAdmin = false
        this._isAchiever = false
        this._isSpectator = false

        if (this._collectiveGoal.isPublic) {
          this.initCollectiveGoal()
        } else {

          // check invite token
          this.route.queryParams.subscribe(data => {
            if (data.invite_token) {
              const access = this.inviteTokenService.checkInviteTokenOfCollectiveGoal(this.collectiveGoalId, data.invite_token)
              access ? this.initCollectiveGoal() : this.initNoAccess()
            } else {
              this.initNoAccess()
            }
          })
        }

      }
    })

  }

  async initCollectiveGoal(): Promise<void> {

    this._collectiveGoalExistsAndUserHasAccess = true

    //Getting all the goals that belong to this collective goal.
    if (this._collectiveGoal.isPublic) {
      this.goalColObs = this.db.colWithIds$(`Goals`, ref => ref.where('collectiveGoal.id', '==', this.collectiveGoalId).where('publicity', '==', enumGoalPublicity.public).where('isFinished', '==', false).orderBy('createdAt', 'desc'))
      this._finishedColObs = this.db.colWithIds$(`Goals`, ref => ref.where('collectiveGoal.id', '==', this.collectiveGoalId).where('publicity', '==', enumGoalPublicity.public).where('isFinished', '==', true).orderBy('createdAt', 'desc'))
    } else {
      this.goalColObs = this.db.colWithIds$(`Goals`, ref => ref.where('collectiveGoal.id', '==', this.collectiveGoalId).where('publicity', 'in', [enumGoalPublicity.collectiveGoalOnly, enumGoalPublicity.public]).where('isFinished', '==', false).orderBy('createdAt', 'desc'))
      this._finishedColObs = this.db.colWithIds$(`Goals`, ref => ref.where('collectiveGoal.id', '==', this.collectiveGoalId).where('publicity', 'in', [enumGoalPublicity.collectiveGoalOnly, enumGoalPublicity.public]).where('isFinished', '==', true).orderBy('createdAt', 'desc'))
    }

    //Getting all stakeholder data
    this.stakeholderColObs = this.db.colWithIds$(`CollectiveGoals/${this.collectiveGoalId}/CGStakeholders`)

    //Getting all templates
    this.templateColObs = this.db.colWithIds$(`CollectiveGoals/${this.collectiveGoalId}/Templates`, ref => ref.orderBy('numberOfTimesUsed', 'desc'))

    // SEO
    this._seo.generateTags({
      title: `${this._collectiveGoal.title} - Strive Journal`,
      description: this._collectiveGoal.shortDescription,
      image: this._collectiveGoal.image
    })

    this._pageIsLoading = false

  }

  async initNoAccess(): Promise<void> {

    this._collectiveGoalExistsAndUserHasAccess = false

    this._seo.generateTags({ title: `Page not found - Strive Journal` })

    this._pageIsLoading = false

  }

  ionViewDidEnter() {
    if (this._platform.is('android') || this._platform.is('ios')) {
      this._backBtnSubscription = this._platform.backButton.subscribe(() => {
        this.navCtrl.back();
      });
    }
  }

  ionViewWillLeave() {
    if (this._platform.is('android') || this._platform.is('ios')) {
      this._backBtnSubscription.unsubscribe();
    }
  }

  //Collective Goal Section
  async presentCollectiveGoalOptionsPopover(ev: UIEvent): Promise<void> {

    const collectiveGoal: ICollectiveGoal = await this.collectiveGoalService.getCollectiveGoal(this.collectiveGoalId)

    const popover = await this.popoverCtrl.create({
      component: CollectiveGoalOptionsPage,
      event: ev,
      componentProps: {
        isAdmin: this._isAdmin,
        isPublic: collectiveGoal.isPublic
      }
    })
    await popover.present()
    await popover.onDidDismiss().then((data) => {
      switch (data.data) {
        case enumCollectiveGoalOptions.EditNotificationSettings:
          break
        case enumCollectiveGoalOptions.ViewNotifications:
          break
        case enumCollectiveGoalOptions.editCollectiveGoal:
          this.editCollectiveGoal()
          break
        case enumCollectiveGoalOptions.deleteCollectiveGoal:
          this.deleteCollectiveGoal()
          break
      }
    })
  }

  private async editCollectiveGoal(): Promise<void> {

    const collectiveGoal = await this.collectiveGoalService.getCollectiveGoal(this.collectiveGoalId)

    const modal = await this.modalCtrl.create({
      component: CreateCollectiveGoalPage,
      componentProps: { id: this.collectiveGoalId, data: collectiveGoal }
    })
    await modal.present()
  }

  public async deleteCollectiveGoal(): Promise<void> {

    const alert = await this.alertCtrl.create({
      subHeader: `Are you sure you want to delete this collective goal?`,
      message: `This action is irreversible. Goals will not be deleted`,
      buttons: [
        {
          text: 'Yes',
          handler: async () => {

            await this.collectiveGoalService.delete(this.collectiveGoalId)
            await this.navCtrl.navigateRoot(`/explore`)

          }
        },
        {
          text: 'No',
          role: 'cancel'
        }
      ]
    })

    await alert.present()

  }

  public async _saveDescription(description: string): Promise<void> {

    this._collectiveGoal.description = description

    await this.db.upsert(`CollectiveGoals/${this.collectiveGoalId}`, {
      description: description
    })

  }

  public async _openSharePopover(ev: UIEvent): Promise<void> {

    if (this._platform.is('android') || this._platform.is('ios')) {

      const ref = await this.inviteTokenService.getShareLink(this.collectiveGoalId, true, this._collectiveGoal.isPublic, this._isAdmin)

      let shareRet = await Share.share({
        title: this._collectiveGoal.title,
        text: 'Check out this collective goal',
        url: ref,
        dialogTitle: 'Together we achieve!'
      });

    } else {

      const popover = await this.popoverCtrl.create({
        component: CollectiveGoalSharePopoverPage,
        event: ev,
        componentProps: {
          collectiveGoal: this._collectiveGoal,
          isAdmin: this._isAdmin
        }
      })
      await popover.present()

    }

  }

  async toggleSpectator(): Promise<void> {
    await this.collectiveGoalStakeholderService.upsert(this.user.uid, this.collectiveGoalId, { isSpectator: !this._isSpectator })
  }

  async createGoal(): Promise<void> {

    const collectiveGoal = await this.collectiveGoalService.getCollectiveGoal(this.collectiveGoalId)

    const modal = await this.modalCtrl.create({
      component: CreateGoalPage,
      componentProps: {
        collectiveGoalId: this.collectiveGoalId,
        collectiveGoalTitle: collectiveGoal.title,
        collectiveGoalIsPublic: collectiveGoal.isPublic,
        collectiveGoalImage: collectiveGoal.image
      }
    })
    await modal.present()

  }

  async requestCreateGoal(): Promise<void> {

    // TODO: Create request - now it just creates a goal without asking
    this.createGoal()

  }

  public async toggleAdmin(stakeholder: ICollectiveGoalStakeholder): Promise<void> {

    event.preventDefault()
    event.stopPropagation()

    const alert = await this.alertCtrl.create({
      subHeader: `Are you sure you want to make ${stakeholder.username} an admin?`,
      buttons: [
        {
          text: 'Yes',
          handler: () => {

            this.collectiveGoalStakeholderService.upsert(stakeholder.id, this._collectiveGoal.id, {
              isAdmin: !stakeholder.isAdmin
            })

          }
        },
        {
          text: 'No',
          role: 'cancel'
        }
      ]
    })

    await alert.present()

  }

  public async toggleAchiever(stakeholder: ICollectiveGoalStakeholder): Promise<void> {

    event.preventDefault()
    event.stopPropagation()

    this.collectiveGoalStakeholderService.upsert(stakeholder.id, this._collectiveGoal.id, {
      isAchiever: !stakeholder.isAchiever
    })

  }

}
