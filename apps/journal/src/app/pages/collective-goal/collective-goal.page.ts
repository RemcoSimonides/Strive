import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { orderBy } from '@angular/fire/firestore';
// Ionic
import { ModalController, PopoverController, AlertController, NavController, Platform } from '@ionic/angular';
// Rxjs
import { Observable,  Subscription, of, combineLatest } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
// Modals
import { UpsertCollectiveGoalPage } from '@strive/collective-goal/collective-goal/modals/upsert/upsert.component';
import { UpsertGoalModalComponent } from '@strive/goal/goal/components/upsert/upsert.component';
// Popovers
import { CollectiveGoalOptionsPage, enumCollectiveGoalOptions } from './popovers/options/options.component'
import { CollectiveGoalSharePopoverPage } from './popovers/share/share.component';
// Services
import { CollectiveGoalStakeholderService } from '@strive/collective-goal/stakeholder/+state/stakeholder.service';
import { InviteTokenService } from '@strive/utils/services/invite-token.service';
import { SeoService } from '@strive/utils/services/seo.service';
import { UserService } from '@strive/user/user/+state/user.service';
import { CollectiveGoalService } from '@strive/collective-goal/collective-goal/+state/collective-goal.service';
import { TemplateService } from '@strive/template/+state/template.service';
// Interfaces
import { Template } from '@strive/template/+state/template.firestore'
import { Goal } from '@strive/goal/goal/+state/goal.firestore'
import { CollectiveGoal } from '@strive/collective-goal/collective-goal/+state/collective-goal.firestore';
import { CollectiveGoalStakeholder } from '@strive/collective-goal/stakeholder/+state/stakeholder.firestore'

import { Share } from '@capacitor/share';

@Component({
  selector: 'app-collective-goal',
  templateUrl: './collective-goal.page.html',
  styleUrls: ['./collective-goal.page.scss'],
})
export class CollectiveGoalPage implements OnInit, OnDestroy {
  pageIsLoading = true
  canAccess = false

  collectiveGoalId: string
  collectiveGoal$: Observable<CollectiveGoal>

  templates$: Observable<Template[]>
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
    private stakeholder: CollectiveGoalStakeholderService,
    private inviteTokenService: InviteTokenService,
    private template: TemplateService,
    private modalCtrl: ModalController,
    private navCtrl: NavController,
    private platform: Platform,
    private popoverCtrl: PopoverController,
    private route: ActivatedRoute,
    private seo: SeoService,
  ) { }

  ngOnInit() {
    this.collectiveGoalId = this.route.snapshot.paramMap.get('id')

    //Get collective goal data
    this.collectiveGoal$ = this.collectiveGoalService.valueChanges(this.collectiveGoalId)

    //Get current users' rights
    this.profileSubscription = this.user.profile$.pipe(
      map(profile => !!profile ? this.stakeholder.valueChanges(this.user.uid, { collectiveGoalId: this.collectiveGoalId }) : of(undefined)),
      switchMap(stakeholder$ => combineLatest([
        stakeholder$,
        this.collectiveGoal$
      ])
    )).subscribe(async ([stakeholder, collectiveGoal]) => {
      this.isAchiever = stakeholder?.isAchiever ?? false
      this.isAdmin = stakeholder?.isAdmin ?? false
      this.isSpectator = stakeholder?.isSpectator ?? false

      if (!!collectiveGoal) {
        let access = !collectiveGoal.isSecret
        if (!access && !!stakeholder) access = stakeholder.isAdmin || stakeholder.isAchiever || stakeholder.isSpectator
        if (!access) access = await this.inviteTokenService.checkInviteToken('collectiveGoal', this.collectiveGoalId)  
        access ? this.initCollectiveGoal(collectiveGoal) : this.initNoAccess()
      } else {
        this.initNoAccess()
      }
    })
  }

  async initCollectiveGoal(collectiveGoal: CollectiveGoal) {
    if (!this.canAccess) {
      this.canAccess = true
      this.goals$ = this.collectiveGoalService.getGoals(this.collectiveGoalId, collectiveGoal.isSecret)
      this.stakeholders$ = this.stakeholder.valueChanges({ collectiveGoalId: this.collectiveGoalId })
      this.templates$ = this.template.valueChanges([orderBy('numberOfTimesUsed', 'desc')], { collectiveGoalId: this.collectiveGoalId })
  
      // SEO
      this.seo.generateTags({
        title: `${collectiveGoal.title} - Strive Journal`,
        description: collectiveGoal.shortDescription,
        // image: collectiveGoal.image
      })
  
      this.pageIsLoading = false
    }
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
  async openOptionsPopover(ev: UIEvent) {
    const popover = await this.popoverCtrl.create({
      component: CollectiveGoalOptionsPage,
      event: ev,
      componentProps: {
        isAdmin: this.isAdmin
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

  private async editCollectiveGoal() {
    const collectiveGoal = await this.collectiveGoalService.getValue(this.collectiveGoalId)

    this.modalCtrl.create({
      component: UpsertCollectiveGoalPage,
      componentProps: { id: this.collectiveGoalId, data: collectiveGoal }
    }).then(modal => modal.present())
  }

  public async deleteCollectiveGoal() {
    return this.alertCtrl.create({
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
    }).then(alert => alert.present())

  }

  public saveDescription(description: string) {
    this.collectiveGoalService.upsert({ id: this.collectiveGoalId, description });
  }

  public async openSharePopover(collectiveGoal: CollectiveGoal, ev: UIEvent) {
    if (this.platform.is('android') || this.platform.is('ios') || navigator.share) {

      const ref = await this.inviteTokenService.getShareLink(this.collectiveGoalId, true, collectiveGoal.isSecret, this.isAdmin)
      await Share.share({
        title: collectiveGoal.title,
        text: 'Check out this collective goal',
        url: ref,
        dialogTitle: 'Together we achieve!'
      });

    } else {
      this.popoverCtrl.create({
        component: CollectiveGoalSharePopoverPage,
        event: ev,
        componentProps: {
          collectiveGoal: collectiveGoal,
          isAdmin: this.isAdmin
        }
      }).then(popover => popover.present())
    }
  }

  createGoal() {
    this.modalCtrl.create({
      component: UpsertGoalModalComponent,
      componentProps: {
        collectiveGoalId: this.collectiveGoalId
      }
    }).then(modal => modal.present())
  }

  public toggleAdmin(stakeholder: CollectiveGoalStakeholder, event: Event) {
    event.preventDefault()
    event.stopPropagation()

    this.alertCtrl.create({
      subHeader: `Are you sure you want to make ${stakeholder.username} an admin?`,
      buttons: [
        {
          text: 'Yes',
          handler: () => {
            this.stakeholder.upsert({
              uid: stakeholder.uid,
              isAdmin: !stakeholder.isAdmin
            }, { params: { collectiveGoalId: this.collectiveGoalId }})
          }
        },
        {
          text: 'No',
          role: 'cancel'
        }
      ]
    }).then(alert => alert.present())
  }

  public toggleAchiever(stakeholder: CollectiveGoalStakeholder, event: Event) {
    event.preventDefault()
    event.stopPropagation()

    return this.stakeholder.upsert({
      uid: stakeholder.uid,
      isAchiever: !stakeholder.isAchiever,
    }, { params: { collectiveGoalId: this.collectiveGoalId }})
  }
}
