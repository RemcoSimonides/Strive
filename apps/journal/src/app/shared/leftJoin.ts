import { AngularFirestore } from '@angular/fire/firestore';

import { combineLatest, of, defer } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

// https://angularfirebase.com/lessons/firestore-joins-similar-to-sql/
export function leftJoin(
  afs: AngularFirestore,
  field: string,
  collection: string
) {
  return source =>
    defer((): any[] => {
      // Operator state
      let collectionData;

      return source.pipe(
        switchMap(data => {
          // Clear mapping on each emitted val ;
          // Save the parent data state
          collectionData = data as any[];

          const reads$ = [];
          for (const doc of collectionData) {

            const data = doc.payload.doc.data()
            // Push doc read to Array
            if (data[field]) {
              // Perform query on join key, with optional limit
              reads$.push(afs.doc(`${collection}/${data[field]}`).valueChanges());
            } else {
              reads$.push(of([]));
            }
          }

          return combineLatest(reads$);
        }),
        map(joins => {
          return collectionData.map((v, i) => {
            const id = v.payload.doc.id
            const discussion = joins[i]
            return { id, ...v.payload.doc.data(), discussion };
          });
        })
      );
    });
};