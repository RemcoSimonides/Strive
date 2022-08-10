import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import { Location } from '@angular/common'
import { ModalController, PopoverController } from '@ionic/angular'
import { createGoalStakeholder, GoalStakeholder } from '@strive/model'
import { GoalStakeholderService } from '@strive/goal/stakeholder/stakeholder.service'
import { UserService } from '@strive/user/user/user.service'
import { combineLatest, Observable } from 'rxjs'
import { map, shareReplay, startWith } from 'rxjs/operators'
import { FormControl } from '@angular/forms'
import { delay } from '@strive/utils/helpers'
import { ModalDirective } from '@strive/utils/directives/modal.directive'
import { RolesPopoverComponment } from '../../popovers/roles/roles.component'

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
}