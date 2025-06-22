import { CommonModule, Location } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core'
import { Router } from '@angular/router'

import { IonTitle, IonContent, IonList, IonItem, IonAvatar, IonLabel, IonButton, IonIcon, ModalController, PopoverController } from '@ionic/angular/standalone'
import { addIcons } from 'ionicons'
import { ellipsisVertical } from 'ionicons/icons'

import { joinWith } from 'ngfire'
import { combineLatest, map, Observable } from 'rxjs'

import { ImageDirective } from '@strive/media/directives/image.directive'
import { RolesPopoverComponent } from '@strive/stakeholder/popovers/roles/roles.component'
import { AuthModalComponent, enumAuthSegment } from '@strive/auth/components/auth-modal/auth-modal.page'
import { AddSupportModalComponent } from '@strive/support/modals/add/add.component'
import { HeaderModalComponent } from '@strive/ui/header-modal/header-modal.component'

import { AuthService } from '@strive/auth/auth.service'
import { GoalStakeholderService } from '@strive/stakeholder/stakeholder.service'
import { ProfileService } from '@strive/user/profile.service'
import { GoalService } from '@strive/goal/goal.service'

import { ModalDirective } from '@strive/utils/directives/modal.directive'
import { createGoalStakeholder, GoalStakeholder, Stakeholder } from '@strive/model'

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
    selector: '[goalId] strive-supporters-modal',
    templateUrl: './supporters.component.html',
    styleUrls: ['./supporters.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SupportersModalComponent extends ModalDirective implements OnInit {

  @Input() goalId = ''

  view$?: Observable<{
    you: Stakeholder
    others: Stakeholder[]
  }>

  constructor(
    private auth: AuthService,
    private goalService: GoalService,
    protected override location: Location,
    protected override modalCtrl: ModalController,
    private popoverCtrl: PopoverController,
    private profileService: ProfileService,
    private router: Router,
    private stakeholderService: GoalStakeholderService,
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
        const others = stakeholders.filter(stakeholder => stakeholder.isSupporter).filter(stakeholder => stakeholder.uid !== user?.uid)
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

  openRoles(stakeholder: GoalStakeholder, event: UIEvent) {
    this.popoverCtrl.create({
      component: RolesPopoverComponent,
      componentProps: {
        stakeholder,
        goalId: this.goalId,
      },
      event
    }).then(popover => popover.present())
  }

  async support() {
    if (!this.auth.uid) {
      const modal = await this.modalCtrl.create({
        component: AuthModalComponent,
        componentProps: {
          authSegment: enumAuthSegment.login
        }
      })
      modal.onDidDismiss().then(({ data: loggedIn }) => {
        if (loggedIn) this.support()
      })
      return modal.present()
    }

    const goal = await this.goalService.getValue(this.goalId)
    this.modalCtrl.create({
      component: AddSupportModalComponent,
      componentProps: { goal }
    }).then(modal => modal.present())
  }
}
