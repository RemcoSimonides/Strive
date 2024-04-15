import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ReactiveFormsModule } from '@angular/forms'
import { UpsertPostModalComponent } from './post-upsert.component'

import { DatetimeModule } from '@strive/ui/datetime/datetime.module'
import { SafePipe } from '@strive/utils/pipes/safe-url.pipe'
import { ImagesSelectorComponent } from '@strive/media/components/images-selector/images-selector.component'
import { IonHeader, IonToolbar, IonButtons, IonButton, IonIcon, IonTitle, IonContent, IonList, IonItem, IonTextarea, IonInput, IonSpinner, IonFooter } from '@ionic/angular/standalone'

@NgModule({
	imports: [
		CommonModule,
		ReactiveFormsModule,
		ImagesSelectorComponent,
		DatetimeModule,
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
