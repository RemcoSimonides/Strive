import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { GoalService } from '@strive/goal/goal/goal.service';
import { GoalForm } from '@strive/goal/goal/forms/goal.form';
import { Subscription } from 'rxjs';

@Component({
  selector: 'goal-slide-2',
  templateUrl: './slide-2.component.html',
  styleUrls: ['./slide-2.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Slide2Component implements OnDestroy {
  @Input() form: GoalForm
  @Input() goalId: string

  @Output() stepper = new EventEmitter<'next' | 'previous'>()

  fields: Record<string, { title: string, description: string, placeholder: string }> = {
    why: {
      title: 'Why do you want to achieve this goal?',
      description: `Connect your purpose with this goal. Why do you want to achieve this goal?`,
      placeholder: `e.g. working on this goal will improve my lifestyle and I will feel more energetic, healthy and ...`
    },
    // where: {
    //   title: 'Where will it take place?',
    //   description: ''
    // },
    inspiration: {
      title: 'What or who inspired you?',
      description: 'Being reminded of what or who inspired you to start this goal will motivate you to keep striving during hard moments.',
      placeholder: `e.g. listened to an interesting podcast about how to life longer ...`
    },
    stop: {
      title: 'What is holding you back?',
      description: `What is stopping you? Are you stuck in your bad habits? Not having enough time? Why don't you do less of what you rather not do.`,
      placeholder: `e.g. afraid of my friends and family raising their eyebrows when they notice ...`
    },
    else: {
      title: 'Anything else',
      description: `Anything else you'd like to mention. Where will it take place? A special thanks to family or friends? anything`,
      placeholder: `e.g. location, shout outs, sources of inspiration, ...`
    }
  }

  descriptionForm = new FormGroup({
    why: new FormControl(''),
    // where: new FormControl(''),
    inspiration: new FormControl(''),
    stop: new FormControl(''),
    else: new FormControl('')
  })

  private sub: Subscription = this.descriptionForm.valueChanges.subscribe(value => {
    let description = ''
    for (const key in value) {
      if (value[key]) {
        description += `<h2>${this.fields[key].title}</h2><p>${value[key]}</p>`
      }
    }
    this.form.description.setValue(description);
    this.form.description.markAsDirty()
  })

  constructor(private goal: GoalService) {}

  ngOnDestroy() {
    this.sub.unsubscribe()
  }

  step(direction: 'next' | 'previous') {
    if (this.form.description.dirty) {
      this.goal.upsert({ id: this.goalId, description: this.form.description.value })
      this.form.description.markAsPristine()
    }
    this.stepper.emit(direction)
  }

  keepOriginalOrder = (a, b) => a.key
}