import { ChangeDetectionStrategy, Component } from "@angular/core";
import { docSnapshots, Firestore } from "@angular/fire/firestore";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { map } from "rxjs";
import { Features, Feature } from './features.model';

@Component({
  selector: 'admin-features',
  templateUrl: './features.component.html',
  styleUrls: ['./features.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FeaturesComponent {

  form = new FormGroup({
    header: new FormControl('', { nonNullable: true, validators: [Validators.required]}),
    description: new FormControl('', { nonNullable: true, validators: [Validators.required]} ),
    url: new FormControl('https://strivejournal.com/', { nonNullable: true })
  })

  private ref = doc(this.db, 'miscellaneous/feature')
  features$ = docSnapshots(this.ref).pipe(map(snap => (snap.data() as Features)))

  constructor(private db: Firestore) {}

  async update() {
    if (this.form.invalid) return

    const feature: Feature = {
      ...this.form.getRawValue(),
      createdAt: new Date()
    }

    this.form.reset()

    const features = await getDoc(this.ref).then(snap => snap.data() as Features)
    features.features.push(feature)

    updateDoc(this.ref, { features: features.features })
  }

}