import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, Input, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren, inject } from '@angular/core'
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms'

import { IonButton, IonIcon, IonContent, IonInfiniteScroll, IonInfiniteScrollContent, IonFooter, IonItem, IonTextarea, IonPopover, IonList, InfiniteScrollCustomEvent, Platform, ScrollCustomEvent } from '@ionic/angular/standalone'
import { addIcons } from 'ionicons'
import { settingsOutline, send } from 'ionicons/icons'

import { collection, DocumentData, getDocs, getFirestore, limit, orderBy, Query, query, QueryConstraint, startAfter, where } from 'firebase/firestore'
import { joinWith } from '@strive/utils/firebase'
import { toDate } from '@strive/utils/firebase'

import { BehaviorSubject, firstValueFrom, Observable, of, Subscription } from 'rxjs'
import { distinctUntilChanged, filter, map, shareReplay, skip, switchMap } from 'rxjs/operators'

import { CommentService } from '@strive/chat/comment.service'
import { GoalStakeholderService } from '@strive/stakeholder/stakeholder.service'
import { ProfileService } from '@strive/user/profile.service'
import { AuthService } from '@strive/auth/auth.service'

import { Goal, Comment, createComment, GoalStakeholder, createGoalStakeholder } from '@strive/model'

import { delay } from '@strive/utils/helpers'
import { ModalDirective } from '@strive/utils/directives/modal.directive'
import { AuthModalComponent, enumAuthSegment } from '@strive/auth/components/auth-modal/auth-modal.page'
import { AddSupportModalComponent } from '@strive/support/modals/add/add.component'
import { GoalService } from '@strive/goal/goal.service'
import { ImageDirective } from '@strive/media/directives/image.directive'
import { TimeAgoPipe } from '@strive/utils/pipes/time-ago.pipe'
import { HTMLPipe } from '@strive/utils/pipes/string-to-html.pipe'
import { JoinButtonComponent } from '@strive/goal/components/join-button/join-button.component'
import { HeaderModalComponent } from '@strive/ui/header-modal/header-modal.component'
import { ThinkingPipe } from '@strive/chat/pipes/thinking.pipe'
import { PageLoadingComponent } from '@strive/ui/page-loading/page-loading.component'

@Component({
    selector: '[goal] strive-chat',
    templateUrl: './chat.component.html',
    styleUrls: ['./chat.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        ImageDirective,
        TimeAgoPipe,
        HTMLPipe,
        JoinButtonComponent,
        HeaderModalComponent,
        ThinkingPipe,
        PageLoadingComponent,
        IonButton,
        IonIcon,
        IonContent,
        IonInfiniteScroll,
        IonInfiniteScrollContent,
        IonFooter,
        IonItem,
        IonTextarea,
        IonPopover,
        IonList
    ]
})
export class ChatModalComponent extends ModalDirective implements OnInit, AfterViewInit, OnDestroy {
  private auth = inject(AuthService);
  private commentService = inject(CommentService);
  private goalService = inject(GoalService);
  private platform = inject(Platform);
  private profileService = inject(ProfileService);
  private stakeholderService = inject(GoalStakeholderService);

  @ViewChild(IonContent) content?: IonContent
  @ViewChildren('item') list?: QueryList<ElementRef>
  @Input() goal!: Goal
  @Input() collectiveStakeholder?: GoalStakeholder

  stakeholder$?: Observable<GoalStakeholder>

  private commentsPerQuery = 20
  private query?: Query<DocumentData>

  private _comments = new BehaviorSubject<Comment[]>([])
  private _done = new BehaviorSubject<boolean>(false)
  private _loading = new BehaviorSubject<boolean>(false)
  comments$ = this._comments.asObservable().pipe(
    // need to make comments unique because of bug in Collection Service and two listeners to last message (lastCheckedChat and new messages)
    map(comments => comments.filter((item, i) => comments.findIndex(c => c.id === item.id) === i)),
    joinWith({
      user: comment => comment.userId ? this.profileService.docData(comment.userId) : of(undefined)
    }),
    map(comments => comments.filter(comment => comment.user))
  )
  done$ = this._done.asObservable()

  scrolledToBottom = true
  scrolledToBottomGenerous = true

  form = new FormControl('', { validators: [Validators.required], nonNullable: true })

  private subs: Subscription[] = []

  constructor() {
    super()

    const sub = this.platform.keyboardDidShow.subscribe(() => this.content?.scrollToBottom())
    this.subs.push(sub)
    addIcons({ settingsOutline, send });
  }

  async ngOnInit() {
    if (!this.goal) return

    this.stakeholder$ = this.auth.profile$.pipe(
      switchMap(user => user ? this.stakeholderService.docData(user.uid, { goalId: this.goal.id }) : of(undefined)),
      map(value => createGoalStakeholder(value)),
      distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
      shareReplay({ bufferSize: 1, refCount: true })
    )

    const uid = this.auth.uid()
    if (!uid) return

    const stakeholder = await firstValueFrom(this.stakeholder$)
    const { isAdmin, isAchiever, isSupporter } = stakeholder

    if (!isAdmin && !isAchiever && !isSupporter) return

    this.stakeholderService.updateLastCheckedChat(this.goal.id, uid)

    const ref = collection(getFirestore(), `Goals/${this.goal.id}/Comments`)
    const constraints = [
      where('createdAt', '>', stakeholder.createdAt),
      orderBy('createdAt', 'desc'),
      limit(this.commentsPerQuery)
    ]
    this.query = query(ref, ...constraints)

    const sub = this.commentService.collectionData([orderBy('createdAt', 'desc'), limit(1)], { goalId: this.goal.id }).pipe(
      skip(1),
      map(comments => comments[0]),
      filter(comment => !!comment?.createdAt)
    ).subscribe(comment => {
      if (uid) {
        this.stakeholderService.updateLastCheckedChat(this.goal.id, uid) // update last check chat everytime a comment is added
      }
      const existing = this._comments.value.find(c => c.id === comment.id)
      if (existing) {
        existing.text = comment.text // update text if comment already exists
        existing.status = comment.status // update status too
        this._comments.next(this._comments.value)
        if (this.scrolledToBottomGenerous) this.content?.scrollToBottom()
      } else {
        const next = [...this._comments.value, comment]
        this._comments.next(next)
      }
    })
    this.subs.push(sub)

    await this.mapAndUpdate([])
    delay(250).then(() => this.content?.scrollToBottom())
  }

  ngAfterViewInit() {
    this.list?.changes.subscribe(() => {
      if (this.scrolledToBottom) this.content?.scrollToBottom()
    })
  }

  ngOnDestroy() {
    this.subs.forEach(sub => sub.unsubscribe())
  }

  private async mapAndUpdate(queryConstraints: QueryConstraint[]) {
    if (this._done.value || this._loading.value) return
    this._loading.next(true)

    if (!this.query) return
    const snapshot = await getDocs(query(this.query, ...queryConstraints))
    if (!snapshot.empty) {
      const comments = snapshot.docs.map(doc => createComment(toDate({ ...doc.data(), id: doc.id })))
      const next = [...comments.reverse(), ...this._comments.value]
      this._comments.next(next)
    }
    if (snapshot.empty || snapshot.size < this.commentsPerQuery) this._done.next(true)
    this._loading.next(false)
  }

  async more($event: InfiniteScrollCustomEvent) {
    const comments = this._comments.value
    const cursor = comments[0]?.createdAt ?? null

    await Promise.race([
      delay(5000),
      this.mapAndUpdate([startAfter(cursor)])
    ])

    $event.target.complete()
  }

  addReply(event?: Event) {
    if (event) event.preventDefault()
    const text = this.form.value.trim()
    if (!this.form.valid || !text) return
    const uid = this.auth.uid()
    if (!uid) return

    const comment = createComment({
      text,
      userId: uid
    })

    this.form.reset('')
    // this.commentService.add(comment, { params: { goalId: this.goal.id } })
  }

  async logScrolling($event: ScrollCustomEvent) {
    // https://stackoverflow.com/questions/56886454/how-to-detect-scroll-reached-end-in-ion-content-component-of-ionic-4

    if ($event.target.localName != "ion-content") {
      // not sure if this is required, just playing it safe
      return
    }

    const scrollElement = await $event.target.getScrollElement()

    // minus clientHeight because trigger is scrollTop
    // otherwise you hit the bottom of the page before
    // the top screen can get to 80% total document height
    const scrollHeight = scrollElement.scrollHeight - scrollElement.clientHeight
    const currentScrollDepth = $event.detail.scrollTop

    this.scrolledToBottom = scrollHeight < currentScrollDepth + 10
    this.scrolledToBottomGenerous = scrollHeight < currentScrollDepth + 200
  }

  async support() {
    const isLoggedIn = this.auth.isLoggedIn()
    if (!isLoggedIn) {
      const modal = await this.modalCtrl.create({
        component: AuthModalComponent,
        componentProps: {
          authSegment: enumAuthSegment.login
        }
      })
      modal.onDidDismiss().then(({ data: loggedIn }) => {
        if (loggedIn) this.support()
      })
      return modal.present()
    }

    this.modalCtrl.create({
      component: AddSupportModalComponent,
      componentProps: {
        goal: this.goal
      }
    }).then(modal => modal.present())
  }

  toggleAssistant(enableAssistant: boolean) {
    this.goalService.update(this.goal.id, { enableAssistant })
    this.goal.enableAssistant = enableAssistant
  }

  toggleNotifications(goalChat: boolean) {
    const uid = this.auth.uid()
    if (!uid) return
    this.stakeholderService.update({ uid, 'settings.goalChat': goalChat } as any, { goalId: this.goal.id })
  }
}
