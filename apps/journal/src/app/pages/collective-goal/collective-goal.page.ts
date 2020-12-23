import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
// Ionic
import { ModalController, PopoverController, AlertController, NavController, Platform } from '@ionic/angular';
// Rxjs
import { Observable,  Subscription, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
// Modals
import { UpsertCollectiveGoalPage } from './modals/upsert/upsert.component'
import { CreateGoalPage } from '../goal/modals/create-goal/create-goal.page'
// Popovers
import { CollectiveGoalOptionsPage, enumCollectiveGoalOptions } from './popovers/options/options.component'
import { CollectiveGoalSharePopoverPage } from './popovers/share/share.component';
// Services
import { FirestoreService } from 'apps/journal/src/app/services/firestore/firestore.service';
import { CollectiveGoalStakeholderService } from '@strive/collective-goal/stakeholder/+state/stakeholder.service';
import { InviteTokenService } from 'apps/journal/src/app/services/invite-token/invite-token.service';
import { SeoService } from 'apps/journal/src/app/services/seo/seo.service';
import { UserService } from '@strive/user/user/+state/user.service';
import { CollectiveGoalService } from '@strive/collective-goal/collective-goal/+state/collective-goal.service';
// Interfaces
import { ITemplate } from '@strive/interfaces';
import { Goal } from '@strive/goal/goal/+state/goal.firestore'
import { ICollectiveGoal } from '@strive/collective-goal/collective-goal/+state/collective-goal.firestore';
import { CollectiveGoalStakeholder } from '@strive/collective-goal/stakeholder/+state/stakeholder.firestore'

import { Plugins } from '@capacitor/core';
const { Share } = Plugins;

@Component({
  selector: 'app-collective-goal',
  templateUrl: './collective-goal.page.html',
  styleUrls: ['./collective-goal.page.scss'],
})
export class CollectiveGoalPage implements OnInit, OnDestroy {
  pageIsLoading = true
  canAccess = false

  collectiveGoalId: string
  collectiveGoal$: Observable<ICollectiveGoal>
  collectiveGoal: ICollectiveGoal

  templates$: Observable<ITemplate[]>
  goals$: Observable<Goal[]>
  stakeholders$: Observable<CollectiveGoalStakeholder[]>

  isAdmin = false
  isAchiever = false
  isSpectator = false

  private backBtnSubscription: Subscription
  private profileSubscription: Subscription

  constructor(
    private alertCtrl: AlertController,
    public user: UserService,
    private collectiveGoalService: CollectiveGoalService,
    private collectiveGoalStakeholderService: CollectiveGoalStakeholderService,
    private db: FirestoreService,
    private inviteTokenService: InviteTokenService,
    private modalCtrl: ModalController,
    private navCtrl: NavController,
    private platform: Platform,
    private popoverCtrl: PopoverController,
    private route: ActivatedRoute,
    private seo: SeoService,
  ) { }

  async ngOnInit() {

    //Get collective goal id from URL
    this.collectiveGoalId = this.route.snapshot.paramMap.get('id')

    //Get collective goal data
    this.collectiveGoal$ = this.collectiveGoalService.getCollectiveGoalDocObs(this.collectiveGoalId)
    this.collectiveGoal = await this.collectiveGoalService.getCollectiveGoal(this.collectiveGoalId)
    if (!this.collectiveGoal.title) {
      this.initNoAccess()
      return
    }

    //Get current users' rights
    this.profileSubscription = this.user.profile$.pipe(
      switchMap(profile => !!profile ? this.collectiveGoalStakeholderService.getStakeholderDocObs(this.user.uid, this.collectiveGoalId) : of({})
    )).subscribe(async (stakeholder: CollectiveGoalStakeholder | undefined) => {
      let access: boolean = this.collectiveGoal.isPublic

      if (!!stakeholder) {
        this.isAchiever = stakeholder.isAchiever
        this.isAdmin = stakeholder.isAdmin
        this.isSpectator = stakeholder.isSpectator

        if (!access) access = stakeholder.isAdmin || stakeholder.isAchiever || stakeholder.isSpectator
        if (!access) access = await this.inviteTokenService.checkInviteToken('collectiveGoal', this.collectiveGoalId)
      } else {
        this.isAdmin = false
        this.isAchiever = false
        this.isSpectator = false
      }

      access ? this.initCollectiveGoal() : this.initNoAccess()
    })
  }

  async initCollectiveGoal(): Promise<void> {
    this.canAccess = true
    this.goals$ = this.collectiveGoalService.getGoals(this.collectiveGoalId, this.collectiveGoal.isPublic)
    this.stakeholders$ = this.db.colWithIds$(`CollectiveGoals/${this.collectiveGoalId}/CGStakeholders`)
    this.templates$ = this.db.colWithIds$(`CollectiveGoals/${this.collectiveGoalId}/Templates`, ref => ref.orderBy('numberOfTimesUsed', 'desc'))

    // SEO
    this.seo.generateTags({
      title: `${this.collectiveGoal.title} - Strive Journal`,
      description: this.collectiveGoal.shortDescription,
      image: this.collectiveGoal.image
    })

    this.pageIsLoading = false
  }

  initNoAccess() {
    this.pageIsLoading = false
    this.canAccess = false
    this.seo.generateTags({ title: `Page not found - Strive Journal` })
  }

  ionViewDidEnter() {
    if (this.platform.is('android') || this.platform.is('ios')) {
      this.backBtnSubscription = this.platform.backButton.subscribe(() => {
        this.navCtrl.back();
      });
    }
  }

  ionViewWillLeave() {
    if (this.platform.is('android') || this.platform.is('ios')) {
      this.backBtnSubscription.unsubscribe();
    }
  }

  ngOnDestroy() {
    this.profileSubscription.unsubscribe();
  }

  //Collective Goal Section
  async openOptionsPopover(ev: UIEvent): Promise<void> {
    const collectiveGoal: ICollectiveGoal = await this.collectiveGoalService.getCollectiveGoal(this.collectiveGoalId)

    const popover = await this.popoverCtrl.create({
      component: CollectiveGoalOptionsPage,
      event: ev,
      componentProps: {
        isAdmin: this.isAdmin,
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
      component: UpsertCollectiveGoalPage,
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

  public saveDescription(description: string) {
    this.collectiveGoal.description = description
    this.db.upsert(`CollectiveGoals/${this.collectiveGoalId}`, { description })
  }

  public async openSharePopover(ev: UIEvent) {
    if (this.platform.is('android') || this.platform.is('ios')) {

      const ref = await this.inviteTokenService.getShareLink(this.collectiveGoalId, true, this.collectiveGoal.isPublic, this.isAdmin)
      await Share.share({
        title: this.collectiveGoal.title,
        text: 'Check out this collective goal',
        url: ref,
        dialogTitle: 'Together we achieve!'
      });

    } else {
      const popover = await this.popoverCtrl.create({
        component: CollectiveGoalSharePopoverPage,
        event: ev,
        componentProps: {
          collectiveGoal: this.collectiveGoal,
          isAdmin: this.isAdmin
        }
      })
      await popover.present()
    }
  }

  async toggleSpectator(): Promise<void> {
    await this.collectiveGoalStakeholderService.upsert(this.user.uid, this.collectiveGoalId, { isSpectator: !this.isSpectator })
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

  public async toggleAdmin(stakeholder: CollectiveGoalStakeholder): Promise<void> {
    event.preventDefault()
    event.stopPropagation()

    const alert = await this.alertCtrl.create({
      subHeader: `Are you sure you want to make ${stakeholder.username} an admin?`,
      buttons: [
        {
          text: 'Yes',
          handler: () => {
            this.collectiveGoalStakeholderService.upsert(stakeholder.id, this.collectiveGoalId, {
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

  public async toggleAchiever(stakeholder: CollectiveGoalStakeholder): Promise<void> {
    event.preventDefault()
    event.stopPropagation()

    this.collectiveGoalStakeholderService.upsert(stakeholder.id, this.collectiveGoalId, {
      isAchiever: !stakeholder.isAchiever
    })
  }

}
