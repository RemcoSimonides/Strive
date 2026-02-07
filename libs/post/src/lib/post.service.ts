import { Injectable, inject } from '@angular/core'
import { Firestore, addDoc, setDoc, deleteDoc, docData as _docData } from '@angular/fire/firestore'
import { doc, collection } from 'firebase/firestore'
import { createConverter } from '@strive/utils/firebase'
import { Observable } from 'rxjs'

import { createPost, Post } from '@strive/model'

const converter = createConverter<Post>(createPost)

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private firestore = inject(Firestore)

  docData(postId: string, options: { goalId: string }): Observable<Post | undefined> {
    const docRef = doc(this.firestore, `Goals/${options.goalId}/Posts/${postId}`).withConverter(converter)
    return _docData(docRef)
  }

  upsert(post: Post, options: { goalId: string }) {
    if (post.id) {
      const docRef = doc(this.firestore, `Goals/${options.goalId}/Posts/${post.id}`).withConverter(converter)
      return setDoc(docRef, post, { merge: true })
    }
    const colRef = collection(this.firestore, `Goals/${options.goalId}/Posts`).withConverter(converter)
    return addDoc(colRef, post)
  }

  remove(postId: string, options: { goalId: string }) {
    const ref = doc(this.firestore, `Goals/${options.goalId}/Posts/${postId}`)
    return deleteDoc(ref)
  }
}
