import { CommonModule, Location } from '@angular/common'
import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import { IonicModule, ModalController, Platform, PopoverController } from '@ionic/angular'
import { joinWith } from 'ngfire'
import { combineLatest, map, Observable } from 'rxjs'

import { ImageModule } from '@strive/media/directives/image.module'
import { RolesPopoverComponent } from '@strive/stakeholder/popovers/roles/roles.component'

import { AuthService } from '@strive/auth/auth.service'
import { GoalStakeholderService } from '@strive/stakeholder/stakeholder.service'
import { ProfileService } from '@strive/user/profile.service'

import { ModalDirective } from '@strive/utils/directives/modal.directive'
import { delay } from '@strive/utils/helpers'
import { createGoalStakeholder, GoalStakeholder, Stakeholder } from '@strive/model'

@Component({
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    ImageModule,
    RolesPopoverComponent
  ],
  selector: '[goalId] strive-spectators-modal',
  templateUrl: './spectators.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpectatorsModalComponent extends ModalDirective implements OnInit {

  @Input() goalId = ''

  view$?: Observable<{
    you: Stakeholder
    others: Stakeholder[]
  }>

  constructor(
    private auth: AuthService,
    protected override location: Location,
    protected override modalCtrl: ModalController,
    private popoverCtrl: PopoverController,
    private profileService: ProfileService,
    private stakeholderService: GoalStakeholderService,
    private router: Router

  ) {
    super(location, modalCtrl)
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
      map(([ user, stakeholders ]) => {
        const you = stakeholders.find(stakeholder => stakeholder.uid === user?.uid)
        const others = stakeholders.filter(stakeholder => stakeholder.isSpectator).filter(stakeholder => stakeholder.uid !== user?.uid)
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

  stopFollowing() {
    return this.stakeholderService.upsert({
      uid: this.auth.uid,
      goalId: this.goalId,
      isSpectator: false
    }, { params: { goalId: this.goalId }})
  }

  openRoles(stakeholder: GoalStakeholder, event: UIEvent) {
    this.popoverCtrl.create({
      component: RolesPopoverComponent,
      componentProps: { stakeholder, goalId: this.goalId },
      event
    }).then(popover => popover.present())
  }
}