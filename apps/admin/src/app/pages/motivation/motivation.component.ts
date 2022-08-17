import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { doc, getDoc, getFirestore, updateDoc } from 'firebase/firestore';
import { docData } from 'rxfire/firestore';

import { Motivation, Motivations } from '@strive/model';

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

  private ref = doc(getFirestore(), `miscellaneous/motivation`)
  motivations$ = docData(this.ref)

  constructor() {}

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