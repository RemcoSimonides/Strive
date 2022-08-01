import { ChangeDetectionStrategy, Component } from '@angular/core'
import { FormControl } from '@angular/forms'
import { ModalController, PopoverController } from '@ionic/angular'
import { Message } from '@strive/model'
import { DearFutureSelfService } from '@strive/exercises/dear-future-self/dear-future-self.service'

import { DearFutureSelfExplanationComponent } from '@strive/exercises/dear-future-self/components/explanation/explanation.component'
import { MessagePopoverComponent } from '@strive/exercises/dear-future-self/components/message/message.component'
import { UserService } from '@strive/user/user/+state/user.service'
import { ScreensizeService } from '@strive/utils/services/screensize.service'
import { SeoService } from '@strive/utils/services/seo.service'
import { AuthModalComponent, enumAuthSegment } from '@strive/user/auth/components/auth-modal/auth-modal.page'

import { addDays, addYears, endOfYear, format, isFuture, isPast } from 'date-fns'
import { map, Observable, of, shareReplay, switchMap } from 'rxjs'

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

  isLoggedIn$ = this.user.isLoggedIn$

  constructor(
    private dearFutureSelfService: DearFutureSelfService,
    private modalCtrl: ModalController,
    private popoverCtrl: PopoverController,
    public screensize: ScreensizeService,
    private seo: SeoService,
    private user: UserService
  ) {
    this.seo.generateTags({ title: 'Dear Future Self - Strive Journal' })
  }

  async send() {
    if (!this.user.uid) return
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
      cssClass: 'explanation_popover_class'
    }).then(popover => popover.present())
  }

  openAuthModal() {
    this.modalCtrl.create({
      component: AuthModalComponent,
      componentProps: {
        authSegment: enumAuthSegment.login
      }
    }).then(modal => modal.present())
  }
}