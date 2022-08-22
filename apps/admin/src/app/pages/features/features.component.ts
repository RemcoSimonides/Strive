import { ChangeDetectionStrategy, Component } from "@angular/core";
import { docData } from 'rxfire/firestore'
import { FormControl, FormGroup, Validators } from '@angular/forms'
import { doc, getDoc, updateDoc, getFirestore } from 'firebase/firestore'
import { Features, Feature } from '@strive/model'

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

  private ref = doc(getFirestore(), 'miscellaneous/feature')
  features$ = docData(this.ref)

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