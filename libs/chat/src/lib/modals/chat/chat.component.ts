import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core'
import { FormControl, Validators } from '@angular/forms'
import { InfiniteScrollCustomEvent, IonContent, ModalController, Platform, ScrollCustomEvent} from '@ionic/angular'
import { collection, DocumentData, getDocs, getFirestore, limit, orderBy, Query, query, QueryConstraint, startAfter, where } from 'firebase/firestore'
import { joinWith, toDate } from 'ngfire'

import { BehaviorSubject, firstValueFrom, Observable, of, Subscription } from 'rxjs'
import { distinctUntilChanged, filter, map, shareReplay, skip, switchMap } from 'rxjs/operators'

import { CommentService } from '@strive/chat/comment.service'
import { GoalStakeholderService } from '@strive/stakeholder/stakeholder.service'
import { ProfileService } from '@strive/user/profile.service'
import { AuthService } from '@strive/auth/auth.service'

import { Goal, Comment, createComment, GoalStakeholder, createGoalStakeholder } from '@strive/model'

import { delay } from '@strive/utils/helpers'
import { ModalDirective } from '@strive/utils/directives/modal.directive'
import { Location } from '@angular/common'
import { AuthModalComponent, enumAuthSegment } from '@strive/auth/components/auth-modal/auth-modal.page'
import { AddSupportModalComponent } from '@strive/support/modals/add/add.component'


@Component({
  selector: '[goal] strive-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatModalComponent extends ModalDirective implements OnInit, OnDestroy {
  @ViewChild(IonContent) contentArea?: IonContent
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
      user: comment => this.profileService.valueChanges(comment.userId)
    }),
    map(comments => comments.filter(comment => comment.user))
  )
  done$ = this._done.asObservable()

  scrolledToBottom = true

  form = new FormControl('', { validators: [Validators.required], nonNullable: true })

  private subs: Subscription[] = []

  constructor(
    private auth: AuthService,
    private commentService: CommentService,
    protected override location: Location,
    protected override modalCtrl: ModalController,
    protected override platform: Platform,
    private profileService: ProfileService,
    private stakeholderService: GoalStakeholderService
  ) {
    super(location, modalCtrl, platform)
    const sub = this.platform.keyboardDidShow.subscribe(() => this.contentArea?.scrollToBottom())
    this.subs.push(sub)
  }

  async ngOnInit() {
    if (!this.goal) return

    this.stakeholder$ = this.auth.profile$.pipe(
      switchMap(user => user ? this.stakeholderService.valueChanges(user.uid, { goalId: this.goal.id }) : of(undefined)),
      map(value => createGoalStakeholder(value)),
      distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
      shareReplay({ bufferSize: 1, refCount: true })
    )

    if (!this.auth.uid) return

    const stakeholder = await firstValueFrom(this.stakeholder$)
    const { isAdmin, isAchiever, isSupporter } = stakeholder

    if (!isAdmin && !isAchiever && !isSupporter) return

    this.stakeholderService.updateLastCheckedChat(this.goal.id, this.auth.uid)

    const ref = collection(getFirestore(), `Goals/${this.goal.id}/Comments`)
    const constraints = [
      where('createdAt', '>', stakeholder.createdAt),
      orderBy('createdAt', 'desc'),
      limit(this.commentsPerQuery)
    ]
    this.query = query(ref, ...constraints)

    const sub = this.commentService.valueChanges([orderBy('createdAt', 'desc'), limit(1)], { goalId: this.goal.id }).pipe(
      skip(1),
      map(comments => comments[0]),
      filter(comment => !!comment?.createdAt)
    ).subscribe(comment => {
      const next = [...this._comments.value, comment]
      this._comments.next(next)
      if (this.scrolledToBottom) this.contentArea?.scrollToBottom()
    })
    this.subs.push(sub)

    await this.mapAndUpdate([])
    delay(250).then(() => this.contentArea?.scrollToBottom())
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
    if (!this.auth.uid) return

    const comment = createComment({
      text,
      userId: this.auth.uid
    })

    this.form.reset('')
    this.commentService.add(comment, { params: { goalId: this.goal.id }})
    this.stakeholderService.updateLastCheckedChat(this.goal.id, this.auth.uid)
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
  }

  async support() {
    if (!this.auth.uid) {
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
}