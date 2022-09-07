import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import { Location } from '@angular/common'
import { AlertController, ModalController, PopoverController } from '@ionic/angular'
import { createGoalStakeholder, GoalStakeholder } from '@strive/model'
import { GoalStakeholderService } from '@strive/goal/stakeholder/stakeholder.service'
import { UserService } from '@strive/user/user/user.service'
import { combineLatest, firstValueFrom, Observable } from 'rxjs'
import { map, shareReplay, startWith } from 'rxjs/operators'
import { FormControl } from '@angular/forms'
import { delay } from '@strive/utils/helpers'
import { ModalDirective } from '@strive/utils/directives/modal.directive'
import { RolesPopoverComponment } from '../../popovers/roles/roles.component'
import { GoalService } from '@strive/goal/goal/goal.service'

@Component({
  selector: '[goalId] goal-team-modal',
  templateUrl: './team.modal.html',
  styleUrls: ['./team.modal.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TeamModalComponent extends ModalDirective implements OnInit {
  @Input() goalId!: string

  you$?: Observable<GoalStakeholder>
  hasOthers$?: Observable<boolean>
  others$?: Observable<GoalStakeholder[]>

  filter = new FormControl<keyof GoalStakeholder | null>(null)
  
  constructor(
    private alertCtrl: AlertController,
    private goalService: GoalService,
    protected override modalCtrl: ModalController,
    private popoverCtrl: PopoverController,
    private router: Router,
    private stakeholder: GoalStakeholderService,
    private user: UserService,
    protected override location: Location
  ) {
    super(location, modalCtrl)
  }

  ngOnInit() {
    const stakeholders$ = combineLatest([
      this.user.user$,
      this.stakeholder.valueChanges({ goalId: this.goalId })
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
      component: RolesPopoverComponment,
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
            handler: async () => {
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
      subHeader: `You're the only admin of this goal. Please make another person admin.`,
      buttons: [
        {
          text: 'Ok',
          role: 'cancel'
        }
      ]
    }).then(alert => alert.present())
  }
}