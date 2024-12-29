import { CommonModule, Location } from '@angular/common'
import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core'
import { Router } from '@angular/router'

import { IonTitle, IonContent, IonList, IonItem, IonAvatar, IonLabel, IonButton, IonIcon, AlertController, ModalController, PopoverController } from '@ionic/angular/standalone'
import { addIcons } from 'ionicons'
import { ellipsisVertical } from 'ionicons/icons'

import { joinWith } from 'ngfire'
import { combineLatest, firstValueFrom, map, Observable } from 'rxjs'

import { ImageDirective } from '@strive/media/directives/image.directive'
import { RolesPopoverComponent } from '@strive/stakeholder/popovers/roles/roles.component'

import { AuthService } from '@strive/auth/auth.service'
import { GoalStakeholderService } from '@strive/stakeholder/stakeholder.service'
import { GoalService } from '@strive/goal/goal.service'
import { ProfileService } from '@strive/user/profile.service'

import { ModalDirective } from '@strive/utils/directives/modal.directive'
import { createGoalStakeholder, GoalStakeholder, Stakeholder } from '@strive/model'
import { HeaderModalComponent } from '@strive/ui/header-modal/header-modal.component'

@Component({
    imports: [
        CommonModule,
        ImageDirective,
        HeaderModalComponent,
        IonTitle,
        IonContent,
        IonList,
        IonItem,
        IonAvatar,
        IonLabel,
        IonButton,
        IonIcon
    ],
    selector: '[goalId] strive-achievers-modal',
    templateUrl: './achievers.component.html',
    styleUrls: ['./achievers.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AchieversModalComponent extends ModalDirective implements OnInit {

  @Input() goalId = ''

  view$?: Observable<{
    you: Stakeholder
    others: Stakeholder[]
  }>

  constructor(
    private alertCtrl: AlertController,
    private auth: AuthService,
    private goalService: GoalService,
    protected override location: Location,
    protected override modalCtrl: ModalController,
    private popoverCtrl: PopoverController,
    private profileService: ProfileService,
    private stakeholderService: GoalStakeholderService,
    private router: Router

  ) {
    super(location, modalCtrl)
    addIcons({ ellipsisVertical })
  }

  ngOnInit() {
    this.view$ = combineLatest([
      this.auth.user$,
      this.stakeholderService.valueChanges({ goalId: this.goalId }).pipe(
        joinWith({
          profile: stakeholder => this.profileService.valueChanges(stakeholder.uid)
        }, { shouldAwait: true })
      )
    ]).pipe(
      map(([user, stakeholders]) => {
        const you = stakeholders.find(stakeholder => stakeholder.uid === user?.uid)
        const others = stakeholders.filter(stakeholder => stakeholder.isAchiever).filter(stakeholder => stakeholder.uid !== user?.uid)
        return {
          you: you ? you : createGoalStakeholder(),
          others
        }
      })
    )
  }

  navTo(uid: string) {
    const path = ['/profile', uid]
    this.navigateTo(this.router, path)
  }

  async leave() {
    if (!this.view$) return

    const { you, others } = await firstValueFrom(this.view$)
    const otherAdmin = others.some(other => other.isAdmin)

    if (!you.isAdmin || otherAdmin) {
      return this.alertCtrl.create({
        subHeader: `Are you sure you want to leave this goal?`,
        message: you.isSupporter ? 'Your supports will be removed' : '',
        buttons: [
          {
            text: 'Yes',
            handler: () => {
              this.stakeholderService.remove(you.uid, { params: { goalId: this.goalId } })
              this.dismiss()
            }
          },
          {
            text: 'No',
            role: 'cancel'
          }
        ]
      }).then(alert => alert.present())
    }

    if (!others.length) {
      return this.alertCtrl.create({
        subHeader: `You're the only person in this goal which means leaving deletes the goal Are you sure you want to delete this goal?`,
        message: `This action is irreversible`,
        buttons: [
          {
            text: 'Yes',
            handler: async () => {
              await this.goalService.remove(this.goalId)
              this.router.navigate(['/goals'])
            }
          },
          {
            text: 'No',
            role: 'cancel'
          }
        ]
      }).then(alert => alert.present())
    }

    return this.alertCtrl.create({
      subHeader: `You're the only admin of this goal. Please make another person admin first.`,
      buttons: [
        {
          text: 'Ok',
          role: 'cancel'
        }
      ]
    }).then(alert => alert.present())
  }

  openRoles(stakeholder: GoalStakeholder, event: UIEvent) {
    this.popoverCtrl.create({
      component: RolesPopoverComponent,
      componentProps: {
        stakeholder,
        goalId: this.goalId,
        manageRoles: true
      },
      event
    }).then(popover => popover.present())
  }
}
