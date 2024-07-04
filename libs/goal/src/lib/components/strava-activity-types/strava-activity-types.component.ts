import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, signal } from '@angular/core'
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'

import { IonButton, IonCheckbox, IonList, IonItem, IonSelect, IonSelectOption, IonInput, PopoverController } from '@ionic/angular/standalone'
import { DatetimeComponent } from '@strive/ui/datetime/datetime.component'
import { addYears, startOfDay } from 'date-fns'

import { ActivityType, StravaIntegration } from 'libs/model/src/lib/strava'

interface Activity {
  id: ActivityType
  name: string
}

@Component({
  standalone: true,
  selector: 'strive-strava-activity-types',
  templateUrl: './strava-activity-types.component.html',
  styleUrls: ['./strava-activity-types.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonCheckbox,
    IonSelectOption,
    IonButton,
    IonList,
    IonItem,
    IonSelect,
    IonInput
  ]
})
export class StravaActivityTypesComponent {
  activities: Activity[] = [
    { id: "AlpineSki", name: "Alpine Ski" },
    { id: "BackcountrySki", name: "Backcountry Ski" },
    { id: "Canoeing", name: "Canoeing" },
    { id: "Crossfit", name: "Crossfit" },
    { id: "EBikeRide", name: "EBike Ride" },
    { id: "Elliptical", name: "Elliptical" },
    { id: "Golf", name: "Golf" },
    { id: "Handcycle", name: "Handcycle" },
    { id: "Hike", name: "Hike" },
    { id: "IceSkate", name: "Ice Skate" },
    { id: "InlineSkate", name: "Inline Skate" },
    { id: "Kayaking", name: "Kayaking" },
    { id: "Kitesurf", name: "Kitesurf" },
    { id: "NordicSki", name: "Nordic Ski" },
    { id: "Ride", name: "Ride" },
    { id: "RockClimbing", name: "Rock Climbing" },
    { id: "RollerSki", name: "Roller Ski" },
    { id: "Rowing", name: "Rowing" },
    { id: "Run", name: "Run" },
    { id: "Sail", name: "Sail" },
    { id: "Skateboard", name: "Skateboard" },
    { id: "Snowboard", name: "Snowboard" },
    { id: "Snowshoe", name: "Snowshoe" },
    { id: "Soccer", name: "Soccer" },
    { id: "StairStepper", name: "Stair Stepper" },
    { id: "StandUpPaddling", name: "Stand Up Paddling" },
    { id: "Surfing", name: "Surfing" },
    { id: "Swim", name: "Swim" },
    { id: "Velomobile", name: "Velomobile" },
    { id: "VirtualRide", name: "Virtual Ride" },
    { id: "VirtualRun", name: "Virtual Run" },
    { id: "Walk", name: "Walk" },
    { id: "WeightTraining", name: "Weight Training" },
    { id: "Wheelchair", name: "Wheelchair" },
    { id: "Windsurf", name: "Windsurf" },
    { id: "Workout", name: "Workout" },
    { id: "Yoga", name: "Yoga" }
  ]
  form = new FormGroup({
    activities: new FormControl<string[] | undefined>(undefined, { validators: [Validators.required]}),
    date: new FormControl<Date | undefined>(undefined),
  })
  integrationActive = signal(false)

  @Input() set integration(value: StravaIntegration | undefined) {
    if (!value) return
    const activities = value.activityTypes.map((id) => this.activities.find(({ id: _id }) => _id === id) ?? { name: '' }).map((a) => a?.name).filter(a => !!a)
    this.form.patchValue({ activities })
    this.integrationActive.set(true)
  }

  constructor(
    private cdr: ChangeDetectorRef,
    private popoverCtrl: PopoverController
  ) {}

  async openDatePicker() {
		const maxDate = startOfDay(new Date())
    const minDate = addYears(maxDate, -1)

		const popover = await this.popoverCtrl.create({
			component: DatetimeComponent,
			componentProps: { maxDate, minDate },
			cssClass: 'datetime-popover'
		})
		popover.onDidDismiss().then(({ data, role }) => {
      const dateCtrl = this.form.get('date')
      if (!dateCtrl) return
			if (role === 'remove') {
				dateCtrl.setValue(undefined)
				dateCtrl.markAsDirty()
			} else if (role === 'dismiss') {
				const date = new Date(data ?? new Date())
				dateCtrl.setValue(date)
				dateCtrl.markAsDirty()
			}
			this.cdr.markForCheck()
		})
		popover.present()
	}

  submit() {
    const { activities, date } = this.form.value
    if (!activities) return

    const _activities = activities.map((name: string) => this.activities.find(({ name: n }) => n === name) ?? undefined).map((a) => a?.id)
    const _date = date ? startOfDay(new Date(date)).getTime() / 1000 : undefined

    this.popoverCtrl.dismiss({ types: _activities, after: _date })
  }

  disable() {
    console.log('canceld')
  }
}