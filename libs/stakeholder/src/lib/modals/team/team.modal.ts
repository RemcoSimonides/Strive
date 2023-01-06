import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core'
import { FormControl } from '@angular/forms'
import { Router } from '@angular/router'
import { Location } from '@angular/common'
import { AlertController, ModalController, Platform, PopoverController } from '@ionic/angular'

import { combineLatest, firstValueFrom, Observable } from 'rxjs'
import { map, shareReplay, startWith } from 'rxjs/operators'

import { joinWith } from 'ngfire'
import { createGoalStakeholder, GoalStakeholder, User } from '@strive/model'
import { delay } from '@strive/utils/helpers'

import { GoalStakeholderService } from '@strive/stakeholder/stakeholder.service'
import { GoalService } from '@strive/goal/goal.service'
import { AuthService } from '@strive/auth/auth.service'
import { ProfileService } from '@strive/user/profile.service'

import { ModalDirective } from '@strive/utils/directives/modal.directive'
import { RolesPopoverComponent } from '../../popovers/roles/roles.component'

function isTeamMember({ isAdmin, isAchiever, isSupporter, isSpectator }: GoalStakeholder) {
  return isAdmin || isAchiever || isSupporter || isSpectator
}

@Component({
  selector: '[goalId] strive-team-modal',
  templateUrl: './team.modal.html',
  styleUrls: ['./team.modal.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TeamModalComponent extends ModalDirective implements OnInit {
  @Input() goalId!: string
  @Input() role: keyof GoalStakeholder | null = null

  you$?: Observable<GoalStakeholder & { profile: User }>
  hasOthers$?: Observable<boolean>
  others$?: Observable<(GoalStakeholder & { profile: User })[]>

  filter = new FormControl<keyof GoalStakeholder | null>(null)
  
  constructor(
    private auth: AuthService,
    private alertCtrl: AlertController,
    private goalService: GoalService,
    protected override location: Location,
    protected override modalCtrl: ModalController,
    protected override platform: Platform,
    private popoverCtrl: PopoverController,
    private profileService: ProfileService,
    private router: Router,
    private stakeholder: GoalStakeholderService,
  ) {
    super(location, modalCtrl, platform)
  }

  ngOnInit() {
    this.filter.setValue(this.role)

    const stakeholders$ = combineLatest([
      this.auth.user$,
      this.stakeholder.valueChanges({ goalId: this.goalId }).pipe(
        map(stakeholders => stakeholders.filter(isTeamMember)),
        joinWith({
          profile: stakeholder => this.profileService.valueChanges(stakeholder.uid)
        }, { shouldAwait: true })
      ) as Observable<any[]>
    ]).pipe(
      shareReplay({ bufferSize: 1, refCount: true })
    )

    this.you$ = stakeholders$.pipe(
      map(([ user, stakeholders ]) => {
        const stakeholder = stakeholders.filter(stakeholder => stakeholder.uid === user?.uid)[0]
        return stakeholder ? stakeholder : createGoalStakeholder()
      }),
      shareReplay({ bufferSize: 1, refCount: true })
    )

    const others$ = stakeholders$.pipe(
      map(([ user, stakeholders ]) => user ? stakeholders.filter(stakeholder => stakeholder.uid !== user.uid) : stakeholders)
    )

    this.hasOthers$ = others$.pipe(
      map(stakeholders => !!stakeholders.length)
    )

    this.others$ = combineLatest([
      this.filter.valueChanges.pipe(startWith(this.filter.value)),
      others$
    ]).pipe(
      map(([ filter, stakeholders ]) => {
        return filter
        ? stakeholders.filter(stakeholder => stakeholder[filter])
        : stakeholders
      })
    )  
  }

  navTo(uid: string) {
    this.location.back()
    delay(250).then(_ => {
      this.router.navigate(['/profile/', uid])
    })
  }

  openRoles(stakeholder: GoalStakeholder, event: UIEvent) {
    this.popoverCtrl.create({
      component: RolesPopoverComponent,
      componentProps: { stakeholder, goalId: this.goalId },
      event
    }).then(popover => popover.present())
  }

  async leave() {
    if (!this.others$ || !this.you$) return
    
    const [ others, you ] = await Promise.all([
      firstValueFrom(this.others$),
      firstValueFrom(this.you$)
    ])
    const otherAdmin = others.some(other => other.isAdmin)

    if (!you.isAdmin || otherAdmin) {
      return this.alertCtrl.create({
        subHeader: `Are you sure you want to leave this goal?`,
        message: you.isSupporter ? 'Your supports will be removed' : '',
        buttons: [
          {
            text: 'Yes',
            handler: () => {
              this.stakeholder.remove(you.uid, { params: { goalId: this.goalId } })
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
}