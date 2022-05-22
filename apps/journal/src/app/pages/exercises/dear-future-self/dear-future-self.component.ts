import { ChangeDetectionStrategy, Component } from "@angular/core";
import { FormControl } from "@angular/forms";
import { PopoverController } from "@ionic/angular";
import { Message } from "@strive/exercises/dear-future-self/+state/dear-future-self.firestore";
import { DearFutureSelfService } from "@strive/exercises/dear-future-self/+state/dear-future-self.service";

import { DearFutureSelfExplanationComponent } from "@strive/exercises/dear-future-self/components/explanation/explanation.component";
import { MessagePopoverComponent } from '@strive/exercises/dear-future-self/components/message/message.component';
import { UserService } from "@strive/user/user/+state/user.service";
import { ScreensizeService } from "@strive/utils/services/screensize.service";

import { addDays, addYears, endOfYear, format, isFuture, isPast } from "date-fns";
import { map, Observable, of, shareReplay, switchMap } from "rxjs";

const initial = `Dear Future Self,


`

@Component({
  selector: 'strive-dear-future-self',
  templateUrl: './dear-future-self.component.html',
  styleUrls: ['./dear-future-self.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DearFutureSelfComponent {
  description = new FormControl(initial)
  date = new FormControl()
  duration?: 2 | 5 | 10
  mode: 'duration' | 'date' = 'duration'

  min = format(addDays(new Date(), 1), 'yyyy-MM-dd')
  max = format(endOfYear(addYears(new Date(), 100)), 'yyyy-MM-dd')

  private messages$: Observable<Message[]> = this.user.user$.pipe(
    switchMap(user => user
      ? this.dearFutureSelfService.getSettings$(user.uid).pipe(map(settings => settings?.messages ?? []))
      : of([])
    ),
    shareReplay({ bufferSize: 1, refCount: true })
  )

  pendingMessages$ = this.messages$.pipe(
    map(messages => messages.filter(message => isFuture(message.deliveryDate as Date)))
  )

  deliveredMessages$ = this.messages$.pipe(
    map(messages => messages.filter(message => isPast(message.deliveryDate as Date)))
  )

  constructor(
    private dearFutureSelfService: DearFutureSelfService,
    private popoverCtrl: PopoverController,
    public screensize: ScreensizeService,
    private user: UserService
  ) {}

  async send() {
    // To do show error message if date is not set. Selecting date can be quite difficult
    if (!this.duration && !this.date.value) return
    if (!this.description.dirty) return

    let deliveryDate: Date;
    if (this.mode === 'duration') {
      deliveryDate = addYears(new Date(), this.duration)
    } else {
      deliveryDate = new Date(this.date.value)
    }

    // saving line breaks
    const description = this.description.value.replace(/\n\r?/g, '<br />');

    const message: Message = {
      description,
      deliveryDate,
      createdAt: new Date()
    }

    await this.dearFutureSelfService.addMessage(this.user.uid, message)

    this.description.reset(initial)
    this.date.reset()
    this.duration = undefined
  }

  openMessage(message: Message) {
    this.popoverCtrl.create({
      component: MessagePopoverComponent,
      componentProps: { message },
      cssClass: 'explanation_popover_class'
    }).then(popover => popover.present())
  }

  openExplanation() {
    this.popoverCtrl.create({
      component: DearFutureSelfExplanationComponent,
      cssClass: "explanation_popover_class"
    }).then(popover => popover.present())
  }
}