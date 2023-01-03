import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core'
import { FormControl } from '@angular/forms'
import { ModalController } from '@ionic/angular'
import { Message } from '@strive/model'
import { DearFutureSelfService } from '@strive/exercises/dear-future-self/dear-future-self.service'

import { MessageModalComponent } from '@strive/exercises/dear-future-self/components/message/message.component'
import { ScreensizeService } from '@strive/utils/services/screensize.service'
import { SeoService } from '@strive/utils/services/seo.service'
import { AuthService } from '@strive/auth/auth.service'
import { PersonalService } from '@strive/user/personal/personal.service'

import { AuthModalComponent, enumAuthSegment } from '@strive/auth/components/auth-modal/auth-modal.page'

import { addDays, addYears, endOfYear, format, isFuture, isPast } from 'date-fns'
import { map, Observable, of, shareReplay, switchMap } from 'rxjs'
import { AES, enc } from 'crypto-js'

const initial = `Dear Future Self,


`

@Component({
  selector: 'journal-dear-future-self',
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
  private messages$: Observable<Message[]> = this.auth.profile$.pipe(
    switchMap(profile => profile
      ? this.dearFutureSelfService.getSettings$(profile.uid).pipe(map(settings => settings?.messages ?? []))
      : of([])
    ),
    switchMap(async messages => {
      const key = await this.personalService.getEncryptionKey()
      for (const message of messages) {
        message.description = AES.decrypt(message.description, key).toString(enc.Utf8)
      }
      return messages
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  )

  pendingMessages$ = this.messages$.pipe(
    map(messages => messages.filter(message => isFuture(message.deliveryDate as Date)))
  )

  deliveredMessages$ = this.messages$.pipe(
    map(messages => messages.filter(message => isPast(message.deliveryDate as Date)))
  )

  isLoggedIn$ = this.auth.isLoggedIn$

  state: 'writing' | 'sending' | 'sent' = 'writing' 

  constructor(
    private auth: AuthService,
    private cdr: ChangeDetectorRef,
    private dearFutureSelfService: DearFutureSelfService,
    private modalCtrl: ModalController,
    private personalService: PersonalService,
    public screensize: ScreensizeService,
    private seo: SeoService
  ) {
    this.seo.generateTags({
      title: 'Dear Future Self - Strive Journal',
      description: 'Surprise your future self with a letter from the past'
    })
  }

  async send() {
    if (!this.auth.uid) return
    if (!this.description.dirty || !this.description.value) return

    let deliveryDate: Date
    if (this.mode === 'duration') {
      if (!this.duration) return
      deliveryDate = addYears(new Date(), this.duration)
    } else {
      if (!this.date.value) return
      deliveryDate = new Date(this.date.value)
    }

    this.state = 'sending'
    this.cdr.markForCheck()

    // saving line breaks
    const value = this.description.value.replace(/\n\r?/g, '<br />')

    const key = await this.personalService.getEncryptionKey()
    const description = AES.encrypt(value, key).toString()

    const message: Message = {
      description,
      deliveryDate,
      createdAt: new Date()
    }

    await this.dearFutureSelfService.addMessage(this.auth.uid, message)

    this.description.reset(initial)
    this.date.reset()
    this.mode = 'duration'
    this.duration = undefined
    this.state = 'sent'
    this.cdr.markForCheck()
  }

  another() {
    this.state = 'writing'
    this.cdr.markForCheck()
  }

  openMessage(message: Message) {
    this.modalCtrl.create({
      component: MessageModalComponent,
      componentProps: { message }
    }).then(modal => modal.present())
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