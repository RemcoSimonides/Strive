import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, OnInit, inject } from '@angular/core'
import { Router } from '@angular/router'

import { IonTitle, IonContent, IonList, IonItem, IonAvatar, IonLabel, IonButton, IonIcon, PopoverController } from '@ionic/angular/standalone'
import { addIcons } from 'ionicons'
import { ellipsisVertical } from 'ionicons/icons'

import { joinWith } from '@strive/utils/firebase'
import { combineLatest, map, Observable } from 'rxjs'

import { ImageDirective } from '@strive/media/directives/image.directive'
import { RolesPopoverComponent } from '@strive/stakeholder/popovers/roles/roles.component'
import { HeaderModalComponent } from '@strive/ui/header-modal/header-modal.component'

import { AuthService } from '@strive/auth/auth.service'
import { GoalStakeholderService } from '@strive/stakeholder/stakeholder.service'
import { ProfileService } from '@strive/user/profile.service'

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
    selector: '[goalId] strive-spectators-modal',
    templateUrl: './spectators.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpectatorsModalComponent extends ModalDirective implements OnInit {
  private auth = inject(AuthService);
  private popoverCtrl = inject(PopoverController);
  private profileService = inject(ProfileService);
  private stakeholderService = inject(GoalStakeholderService);
  private router = inject(Router);


  @Input() goalId = ''

  view$?: Observable<{
    you: Stakeholder
    others: Stakeholder[]
  }>

  constructor() {
    super()

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
    }, { params: { goalId: this.goalId } })
  }

  openRoles(stakeholder: GoalStakeholder, event: UIEvent) {
    this.popoverCtrl.create({
      component: RolesPopoverComponent,
      componentProps: { stakeholder, goalId: this.goalId },
      event
    }).then(popover => popover.present())
  }
}
