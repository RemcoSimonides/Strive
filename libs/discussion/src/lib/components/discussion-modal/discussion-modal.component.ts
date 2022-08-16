import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Location } from '@angular/common';
import { FormControl, Validators } from '@angular/forms';
import { IonContent, ModalController, Platform} from '@ionic/angular';
import { collection, DocumentData, getDocs, getFirestore, limit, orderBy, Query, query, QueryConstraint, startAfter } from 'firebase/firestore';
import { toDate } from 'ngfire';
// Rxjs
import { BehaviorSubject, Subscription } from 'rxjs';
import { filter, map, skip } from 'rxjs/operators';
// Services
import { UserService } from '@strive/user/user/user.service';
import { CommentService } from '@strive/discussion/comment.service';
import { GoalStakeholderService } from '@strive/goal/stakeholder/stakeholder.service';
// Interfaces
import { Goal, Comment, createComment, createCommentSource } from '@strive/model'

import { delay } from '@strive/utils/helpers';
import { ModalDirective } from '@strive/utils/directives/modal.directive';

@Component({
  selector: 'discussion-page',
  templateUrl: './discussion-modal.component.html',
  styleUrls: ['./discussion-modal.component.scss'],
})
export class DiscussionModalComponent extends ModalDirective implements OnInit, OnDestroy {
  @ViewChild(IonContent) contentArea?: IonContent
  @Input() goal!: Goal

  private commentsPerQuery = 20
  private query?: Query<DocumentData>

  private _comments = new BehaviorSubject<Comment[]>([])
  private _done = new BehaviorSubject<boolean>(false)
  private _loading = new BehaviorSubject<boolean>(false)
  comments$ = this._comments.asObservable()
  done$ = this._done.asObservable()

  scrolledToBottom = true

  form = new FormControl('', { validators: [Validators.required], nonNullable: true })

  visibility = {
    public: 'Messages visible to everyone',
    team: 'Messages only visible to team',
    adminsAndRequestor: 'Visible to Requestor and Admins only',
    achievers: 'Visisble to Achievers only',
    spectators: 'Visible to spectators only'
  }

  private subs: Subscription[] = []

  constructor(
    private commentService: CommentService,
    protected override location: Location,
    protected override modalCtrl: ModalController,
    private platform: Platform,
    private stakeholder: GoalStakeholderService,
    public user: UserService
  ) {
    super(location, modalCtrl)

    const sub = this.platform.keyboardDidShow.subscribe(() => this.contentArea?.scrollToBottom())
    this.subs.push(sub)
  }

  async ngOnInit() {
    if (!this.user.uid) return
    this.stakeholder.updateLastCheckedChat(this.goal.id, this.user.uid)

    const ref = collection(getFirestore(), `Goals/${this.goal.id}/Comments`)
    const constraints = [
      orderBy('createdAt', 'desc'),
      limit(this.commentsPerQuery)
    ]
    this.query = query(ref, ...constraints)

    const sub = this.commentService.valueChanges([orderBy('createdAt', 'desc'), limit(1)], { goalId: this.goal.id }).pipe(
      skip(1),
      map(comments => comments[0]),
      filter(comment => !!comment.createdAt)
    ).subscribe(comment => {
      const next = [...this._comments.value, comment]
      this._comments.next(next)
      if (this.scrolledToBottom) this.contentArea?.scrollToBottom()
    })
    this.subs.push(sub)

    await this.mapAndUpdate([])
    delay(0).then(_ => this.contentArea?.scrollToBottom())
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

  async more($event: any) {
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

    const comment = createComment({
      text,
      source: createCommentSource({
        user: this.user.user,
        goal: this.goal
      })
    })

    this.form.reset('')
    this.commentService.add(comment, { params: { goalId: this.goal.id }})
  }

  async logScrolling($event: any) {
    // https://stackoverflow.com/questions/56886454/how-to-detect-scroll-reached-end-in-ion-content-component-of-ionic-4

    if ($event.target.localName != "ion-content") {
      // not sure if this is required, just playing it safe
      return;
    }

    const scrollElement = await $event.target.getScrollElement();

    // minus clientHeight because trigger is scrollTop
    // otherwise you hit the bottom of the page before 
    // the top screen can get to 80% total document height
    const scrollHeight = scrollElement.scrollHeight - scrollElement.clientHeight;
    const currentScrollDepth = $event.detail.scrollTop;

    this.scrolledToBottom = scrollHeight === currentScrollDepth
  }
}