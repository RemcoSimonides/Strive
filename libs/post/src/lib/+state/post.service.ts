import { Injectable } from '@angular/core';
// Services
import { Firestore, DocumentSnapshot } from '@angular/fire/firestore';
import { createUserLink } from '@strive/user/user/+state/user.firestore';
import { UserService } from '@strive/user/user/+state/user.service';
import { FireCollection } from '@strive/utils/services/collection.service';
// Rxjs
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
// Interfaces
import { createPost, Post } from './post.firestore';

@Injectable({
  providedIn: 'root'
})
export class PostService extends FireCollection<Post> {
  readonly path = 'Goals/:goalId/Posts'

  private _syncingPosts = new BehaviorSubject<Record<string, string>>({})
  private syncingPosts$ = this._syncingPosts.asObservable()

  constructor(
    public db: Firestore,
    private user: UserService
  ) {
    super(db)
  }

  protected fromFirestore(snapshot: DocumentSnapshot<Post>) {
    return snapshot.exists()
      ? createPost({ ...snapshot.data(), id: snapshot.id })
      : undefined
  }

  protected async toFirestore(post: Post): Promise<Post> {
    post.author = createUserLink(this.user.user)
    return post
  }

  protected onCreate(entity: Post) {
    if (!entity.isEvidence) {
      const posts = this._syncingPosts.value
      posts[entity.id] = entity.goal.id
      this._syncingPosts.next(posts)
    }
  }

  getSyncingPosts$(goalId: string): Observable<string[]> {
    return this.syncingPosts$.pipe(
      map(syncingPosts => this.getKeys(syncingPosts, goalId))
    )
  }

  /**
   * 
   * @param ids post ids that are created
   * @param goalId 
   * @returns remaning syncing posts of goal
   */
  updateSyncingPosts(ids: string[], goalId: string): string[] {
    const posts = this._syncingPosts.value
    ids.forEach(id => delete posts[id])
    this._syncingPosts.next(posts)
    return this.getKeys(posts, goalId)
  }

  private getKeys(syncingPosts: Record<string, string>, goalId: string): string[] {
    const keys = []
    for (const [key, value] of Object.entries(syncingPosts)) {
      if (value === goalId) keys.push(key)
    }
    return keys
  }

}
