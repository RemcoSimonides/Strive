import { ChangeDetectionStrategy, Component } from '@angular/core';
import { docSnapshots, Firestore, doc, updateDoc, getDoc } from '@angular/fire/firestore';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { map } from 'rxjs/operators';

import { Motivation, Motivations } from './motivation.model';

@Component({
  selector: 'strive-motivation',
  templateUrl: './motivation.component.html',
  styleUrls: ['./motivation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MotivationComponent {

  form = new FormGroup({
    quote: new FormControl('', { nonNullable: true, validators: [Validators.required]}),
    from: new FormControl('', { nonNullable: true, validators: [Validators.required]})
  })

  private ref = doc(this.db, `miscellaneous/motivation`)
  motivations$ = docSnapshots(this.ref).pipe(map(snap => (snap.data()) as Motivations))

  constructor(private db: Firestore) {}

  async update() {
    if (this.form.invalid) return

    const motivation: Motivation = {
      ...this.form.getRawValue(),
      used: false
    }
    this.form.reset()

    const motivations = await getDoc(this.ref).then(snap => snap.data() as Motivations)
    motivations.quotes.push(motivation)

    updateDoc(this.ref, { quotes: motivations.quotes })
  }

  async remove(index: number) {
    const motivations = await getDoc(this.ref).then(snap => snap.data() as Motivations)
    motivations.quotes.splice(index, 1)
    updateDoc(this.ref, { quotes: motivations.quotes })
  }

  getUnused(motivations: Motivation[]) {
    return motivations.filter(motivation => !motivation.used).length
  }

}