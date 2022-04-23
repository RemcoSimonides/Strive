import { Component, HostBinding, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Location } from '@angular/common';
import { NavParams, IonContent, ModalController, Platform} from '@ionic/angular';
import { collection, DocumentData, Firestore, getDocs, limit, orderBy, query, Query, QueryConstraint, startAfter } from '@angular/fire/firestore';
// Rxjs
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
// Services
import { DiscussionService } from '@strive/discussion/+state/discussion.service';
import { UserService } from '@strive/user/user/+state/user.service';
// Interfaces
import { Comment, createComment } from '../../+state/comment.firestore';
import { Discussion } from '../../+state/discussion.firestore';
import { createUserLink } from '@strive/user/user/+state/user.firestore';
import { delay } from '@strive/utils/helpers';
import { filter, map, skip } from 'rxjs/operators';
import { CommentService } from '@strive/discussion/+state/comment.service';

@Component({
  selector: 'discussion-page',
  templateUrl: './discussion-modal.component.html',
  styleUrls: ['./discussion-modal.component.scss'],
})
export class DiscussionModalComponent implements OnInit, OnDestroy {
  private commentsPerQuery = 20
  private query: Query<DocumentData>

  private _comments = new BehaviorSubject<Comment[]>([])
  private _done = new BehaviorSubject<boolean>(false)
  private _loading = new BehaviorSubject<boolean>(false)
  comments$ = this._comments.asObservable()
  done$ = this._done.asObservable()

  scrolledToBottom = true

  private subs: Subscription[] = []

  discussionId: string
  _comment: string
  discussion$: Observable<Discussion>

  visibility = {
    public: 'Messages visible to everyone',
    team: 'Messages only visible to team',
    adminsAndRequestor: 'Visible to Requestor and Admins only',
    achievers: 'Visisble to Achievers only',
    spectators: 'Visible to spectators only'
  }

  @ViewChild(IonContent) contentArea: IonContent
  @HostListener('window:popstate', ['$event'])
  onPopState() {
    this.modalCtrl.dismiss()
  }
  @HostBinding() modal: HTMLIonModalElement

  constructor(
    public user: UserService,
    private db: Firestore,
    private discussion: DiscussionService,
    private location: Location,
    private modalCtrl: ModalController,
    private navParams: NavParams,
    private platform: Platform,
    private commentService: CommentService
  ) {
    window.history.pushState(null, null, window.location.href)

    const sub = this.platform.keyboardDidShow.subscribe(() => this.contentArea?.scrollToBottom())
    this.subs.push(sub)
  }

  async ngOnInit() {
    this.modal.onWillDismiss().then(res => {
      if (res.role === 'backdrop') this.location.back()
    })

    this.discussionId = this.navParams.get('discussionId')
    this.discussion$ = this.discussion.valueChanges(this.discussionId)

    const ref = collection(this.db, `Discussions/${this.discussionId}/Comments`)
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

  dismiss() {
    this.location.back()
  }

  ngOnDestroy() {
    this.subs.forEach(sub => sub.unsubscribe())
  }

  private async mapAndUpdate(queryConstraints: QueryConstraint[]) {
    if (this._done.value || this._loading.value) return
    this._loading.next(true)

    const snapshot = await getDocs(query(this.query, ...queryConstraints))
    if (!snapshot.empty) {
      const comments = snapshot.docs.map(doc => createComment({ ...doc.data(), id: doc.id }))
      const next = [...comments.reverse(), ...this._comments.value]
      this._comments.next(next)
    }
    if (snapshot.empty || snapshot.size < this.commentsPerQuery) this._done.next(true)
    this._loading.next(false)
  }

  async more($event) {
    const comments = this._comments.value
    const cursor = comments[0]?.createdAt ?? null

    await Promise.race([
      delay(5000),
      this.mapAndUpdate([startAfter(cursor)])
    ])

    $event.target.complete()
  }

  async addReply() {
    if (!this._comment.trim()) return

    const comment = createComment({
      text: this._comment.trim(),
      type: 'sentByUser',
      user: createUserLink(this.user.user)
    })
    this._comment = ''
    this.discussion.comment.add(comment, { params: { discussionId: this.discussionId }})

  }

  async logScrolling($event) {
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