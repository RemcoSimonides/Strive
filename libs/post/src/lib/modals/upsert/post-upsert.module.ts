import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ReactiveFormsModule } from '@angular/forms'
import { UpsertPostModalComponent } from './post-upsert.component'

import { DatetimeComponent } from '@strive/ui/datetime/datetime.component'
import { SafePipe } from '@strive/utils/pipes/safe-url.pipe'
import { ImagesSelectorComponent } from '@strive/media/components/images-selector/images-selector.component'
import { IonHeader, IonToolbar, IonButtons, IonButton, IonIcon, IonTitle, IonContent, IonList, IonItem, IonTextarea, IonInput, IonSpinner, IonFooter } from '@ionic/angular/standalone'

@NgModule({
	imports: [
		CommonModule,
		ReactiveFormsModule,
		ImagesSelectorComponent,
		DatetimeComponent,
		SafePipe,
		IonHeader,
		IonToolbar,
		IonButtons,
		IonButton,
		IonIcon,
		IonTitle,
		IonContent,
		IonList,
		IonItem,
		IonTextarea,
		IonInput,
		IonSpinner,
		IonFooter
	],
	declarations: [UpsertPostModalComponent]
})
export class UpsertPostModalModule { }
