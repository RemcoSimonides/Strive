import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Location } from '@angular/common';
import { NavParams, IonContent, ModalController, Platform} from '@ionic/angular';
import { collection, DocumentData, getDocs, getFirestore, limit, orderBy, query, Query, QueryConstraint, startAfter } from 'firebase/firestore';
// Rxjs
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { filter, map, skip } from 'rxjs/operators';
// Services
import { DiscussionService } from '@strive/discussion/+state/discussion.service';
import { UserService } from '@strive/user/user/user.service';
import { CommentService } from '@strive/discussion/+state/comment.service';
// Interfaces
import { Comment, createComment } from '../../+state/comment.firestore';
import { Discussion } from '../../+state/discussion.firestore';
import { createUserLink } from '@strive/model'

import { delay } from '@strive/utils/helpers';
import { ModalDirective } from '@strive/utils/directives/modal.directive';

@Component({
  selector: 'discussion-page',
  templateUrl: './discussion-modal.component.html',
  styleUrls: ['./discussion-modal.component.scss'],
})
export class DiscussionModalComponent extends ModalDirective implements OnInit, OnDestroy {
  private commentsPerQuery = 20
  private query?: Query<DocumentData>

  private _comments = new BehaviorSubject<Comment[]>([])
  private _done = new BehaviorSubject<boolean>(false)
  private _loading = new BehaviorSubject<boolean>(false)
  comments$ = this._comments.asObservable()
  done$ = this._done.asObservable()

  scrolledToBottom = true

  private subs: Subscription[] = []

  discussionId?: string
  _comment?: string
  discussion$?: Observable<Discussion | undefined>

  visibility = {
    public: 'Messages visible to everyone',
    team: 'Messages only visible to team',
    adminsAndRequestor: 'Visible to Requestor and Admins only',
    achievers: 'Visisble to Achievers only',
    spectators: 'Visible to spectators only'
  }

  @ViewChild(IonContent) contentArea?: IonContent

  constructor(
    public user: UserService,
    private discussion: DiscussionService,
    protected override location: Location,
    protected override modalCtrl: ModalController,
    private navParams: NavParams,
    private platform: Platform,
    private commentService: CommentService
  ) {
    super(location, modalCtrl)

    const sub = this.platform.keyboardDidShow.subscribe(() => this.contentArea?.scrollToBottom())
    this.subs.push(sub)
  }

  async ngOnInit() {
    this.discussionId = this.navParams.get('discussionId')
    this.discussion$ = this.discussion.valueChanges(this.discussionId)

    const ref = collection(getFirestore(), `Discussions/${this.discussionId}/Comments`)
    const constraints = [
      orderBy('createdAt', 'desc'),
      limit(this.commentsPerQuery)
    ]
    this.query = query(ref, ...constraints)

    const sub = this.commentService.valueChanges(
      [orderBy('createdAt', 'desc'), limit(1)],
      { discussionId: this.discussionId }
    ).pipe(
      skip(1),
      map(comments => comments[0]),
      filter(comment => !!comment.createdAt)
    ).subscribe(comment => {
      const next = [...this._comments.value, comment]
      this._comments.next(next)
      if (this.scrolledToBottom) {
        this.contentArea?.scrollToBottom()
      }
    })
    this.subs.push(sub)

    await this.mapAndUpdate([])
    this.contentArea?.scrollToBottom()
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
      const comments = snapshot.docs.map(doc => createComment({ ...doc.data(), id: doc.id }))
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

  async addReply() {
    if (!this._comment?.trim()) return
    if (!this.discussionId) return

    const comment = createComment({
      text: this._comment.trim(),
      type: 'sentByUser',
      user: createUserLink(this.user.user)
    })
    this._comment = ''
    this.discussion.comment.add(comment, { params: { discussionId: this.discussionId }})

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