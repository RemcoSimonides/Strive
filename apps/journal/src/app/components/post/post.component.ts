import { Component, OnInit, Input } from '@angular/core';
// Angularfire
import { FirestoreService } from 'apps/journal/src/app/services/firestore/firestore.service';
// Rxjs
import { take } from 'rxjs/operators';
// Interface
import { IPost } from '@strive/interfaces'

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.scss'],
})
export class PostComponent implements OnInit {

  _post: IPost
  @Input() postRef: string
  @Input()
  public set post(post: IPost) {
    this._post = post
  }

  constructor(
    private db: FirestoreService
  ) { }

  ngOnInit() {

    if (this.postRef) {
      this.db.doc<IPost>(this.postRef).snapshotChanges().pipe(take(1)).toPromise().then(snap => {
        if (snap.payload.exists) {
          
          // Post does exist
          this._post = snap.payload.data()
  
        }
      })
    }
    
  }

  ionViewWillEnter() {

  }

  // Depricated Chat
  // async goToPostChat(): Promise<void> {
    // const postChatParams: PostChatParams = {
    //   goalID: '',
    //   postID: ''
    // }
  
    // var splitted = this._postRef.split("/")
    // postChatParams.goalID = splitted[1]
    // postChatParams.postID = splitted[3]

    // this.navCtrl.push('PostChatPage', { postChatParams })
  // }

}
