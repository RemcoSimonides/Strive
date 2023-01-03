import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core'
import { FocusForm } from '@strive/stakeholder/forms/focus.form'
import { GoalStakeholderService } from '@strive/stakeholder/stakeholder.service'
import { AuthService } from '@strive/auth/auth.service'

@Component({
  selector: '[goalId] goal-slide-2',
  templateUrl: './slide-2.component.html',
  styleUrls: ['./slide-2.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Slide2Component {
  @Input() goalId!: string  
  @Output() stepper = new EventEmitter<'next' | 'previous'>()
  
  form = new FocusForm({ on: true })
  fields: Record<string, { title: string, description: string, placeholder: string }> = {
    why: {
      title: 'Why do you want to achieve this goal?',
      description: `Connect your purpose with this goal. Why do you want to achieve this goal?`,
      placeholder: `e.g. working on this goal will improve my lifestyle and I will feel more energetic, healthy and ...`
    },
    inspiration: {
      title: 'What or who inspired you?',
      description: 'Being reminded of what or who inspired you to start this goal will motivate you to keep striving during hard moments.',
      placeholder: `e.g. listened to an interesting podcast about how to life longer ...`
    },
    // stop: {
    //   title: 'What is holding you back?',
    //   description: `What is stopping you? Are you stuck in your bad habits? Not having enough time? Why don't you do less of what you rather not do.`,
    //   placeholder: `e.g. afraid of my friends and family raising their eyebrows when they notice ...`
    // },
    // else: {
    //   title: 'Anything else',
    //   description: `Anything else you'd like to mention. Where will it take place? A special thanks to family or friends? anything`,
    //   placeholder: `e.g. location, shout outs, sources of inspiration, ...`
    // }
  }

  constructor(
    private auth: AuthService,
    private stakeholder: GoalStakeholderService,
  ) {}

  step(direction: 'next' | 'previous') {
    if (this.form.dirty) {

      this.stakeholder.update({
        uid: this.auth.uid,
        focus: this.form.getFocus()
      }, { params: { goalId: this.goalId }})

      this.form.markAsPristine()
    }
    this.stepper.emit(direction)
  }

  keepOriginalOrder = (a: any, b: any) => a.key
}