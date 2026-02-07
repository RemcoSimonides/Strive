import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, ViewChild, inject } from '@angular/core'
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms'

import { IonHeader, IonToolbar, IonButtons, IonButton, IonIcon, IonTitle, IonContent, IonList, IonItem, IonTextarea, IonInput, IonSpinner, IonFooter, PopoverController } from '@ionic/angular/standalone'
import { addIcons } from 'ionicons'
import { close, calendarOutline, linkOutline } from 'ionicons/icons'

import { getFunctions, httpsCallable } from 'firebase/functions'
import { SendIntent } from 'send-intent'

import { captureException } from '@sentry/angular'

import { BehaviorSubject } from 'rxjs'
import { debounceTime, filter } from 'rxjs/operators'
import { addYears } from 'date-fns'

import { PostService } from '@strive/post/post.service'
import { AuthService } from '@strive/auth/auth.service'
import { MediaService } from '@strive/media/media.service'
import { PostForm } from '@strive/post/forms/post.form'
import { createPost, Post } from '@strive/model'
import { isValidHttpUrl } from '@strive/utils/helpers'
import { ModalDirective } from '@strive/utils/directives/modal.directive'
import { DatetimeComponent } from '@strive/ui/datetime/datetime.component'
import { EditMediaForm } from '@strive/media/forms/media.form'
import { ImagesSelectorComponent } from '@strive/media/components/images-selector/images-selector.component'
import { SafePipe } from '@strive/utils/pipes/safe-url.pipe'

@Component({
    selector: '[goalId] strive-post-upsert',
    templateUrl: './post-upsert.component.html',
    styleUrls: ['./post-upsert.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        ImagesSelectorComponent,
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
    ]
})
export class UpsertPostModalComponent extends ModalDirective implements AfterViewInit, OnDestroy {
	private auth = inject(AuthService);
	private cdr = inject(ChangeDetectorRef);
	private mediaService = inject(MediaService);
	private popoverCtrl = inject(PopoverController);
	private postService = inject(PostService);

	@ViewChild(ImagesSelectorComponent) imageSelector?: ImagesSelectorComponent

	postForm = new PostForm()
	saving$ = new BehaviorSubject(false)

	scrapingUrl = false
	mode: 'create' | 'update' = 'create'

	private _post!: Post
	get post() { return this._post }
	@Input() set post(post: Post) {
		if (!post.id) throw new Error('Upsert post modal needs id')
		if (!post.goalId) throw new Error('Upsert post modal needs goalId')
		this._post = post

		this.mode = post.uid ? 'update' : 'create'
		this.postForm.patchValue(post)
	}
	@Input() private image?: File

	private sub = this.postForm.url.valueChanges.pipe(
		debounceTime(1000),
		filter(url => url ? isValidHttpUrl(url) : false)
	).subscribe(async url => {
		if (isYoutube(url)) {
			const id = getYoutubeId(url)
			if (id) {
				this.postForm.youtubeId.setValue(id)
			}
		}

		const formValue = this.postForm.getRawValue()
		if (formValue.description && formValue.medias.length) return

		this.scrapingUrl = true
		this.cdr.markForCheck()

		const scrape = httpsCallable(getFunctions(), 'scrapeMetatags')
		const scraped = await scrape({ url })
		const { error, result } = scraped.data as { error: string, result: any }
		if (error) {
			console.error(result)
			captureException(result)
		} else {
			const { image, description } = result as { image: string, description: string }
			if (!formValue.description) this.postForm.description.setValue(description ?? '')

			if (image) {
				const editMediaForm = new EditMediaForm({ preview: image, type: 'image' })
				this.postForm.controls.medias.push(editMediaForm)
			}
		}

		this.scrapingUrl = false
		this.cdr.markForCheck()
	})

	constructor() {
		super()

		addIcons({ close, calendarOutline, linkOutline });
	}

	ngAfterViewInit() {
		if (this.image) {
			this.imageSelector?.filesSelected(this.image)
		}
	}

	ngOnDestroy() {
		this.sub.unsubscribe()
	}

	async submitPost() {
		const uid = this.auth.uid()
		if (!uid) return
		if (this.postForm.invalid) return
		this.saving$.next(true)

		if (!this.postForm.isEmpty) {
			const { date, description, medias, url, youtubeId } = this.postForm.getRawValue()
			const { goalId } = this.post

			const promises = []
			for (const media of medias) {
				const storagePath = `goals/${goalId}`
				if (media.file) {
					const promise = this.mediaService.upload(media.file, storagePath, goalId).then(id => media.id = id)
					promises.push(promise)
				} else if (media.preview && !media.id) {
					// media has preview if it scraped from an URL
					const promise = this.mediaService.uploadFromURL(media.preview, storagePath, goalId).then(id => media.id = id)
					promises.push(promise)
				}
			}
			await Promise.all(promises)

			const mediaIds = medias ? medias.map(({ id }) => id) : []

			const post = createPost({
				id: this.post.id,
				goalId: this.post.goalId,
				date,
				description,
				mediaIds,
				url,
				youtubeId,
				stravaActivityId: this.post.stravaActivityId,
				uid,
			})

			await this.postService.upsert(post, { goalId: post.goalId })
		}
		this.saving$.next(false)
		this.dismiss(true)
		if (this.image) { // image should only be present if SendIntent is used
			SendIntent.finish()
		}
	}

	async openDatePicker() {
		const maxDate = addYears(new Date(), 1)

		const popover = await this.popoverCtrl.create({
			component: DatetimeComponent,
			componentProps: { maxDate, value: this.postForm.date.value },
			cssClass: 'datetime-popover'
		})
		popover.onDidDismiss().then(({ data, role }) => {
			if (role === 'remove') {
				this.postForm.date.setValue(new Date())
				this.postForm.date.markAsDirty()
			} else if (role === 'dismiss') {
				const date = new Date(data ?? new Date())
				this.postForm.date.setValue(date)
				this.postForm.date.markAsDirty()
			}
			this.cdr.markForCheck()
		})
		popover.present()
	}
}

function isYoutube(url: string) {
	return url.includes("youtube.com") || url.includes("youtu.be")
}

function getYoutubeId(url: string) {
	// https://stackoverflow.com/questions/3452546/how-do-i-get-the-youtube-video-id-from-a-url
	const rx = new RegExp(/^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/|shorts\/)|(?:(?:watch)?\?v(?:i)?=|&v(?:i)?=))([^#&?]*).*/)
	const match = url.match(rx)
	return match?.length === 2 ? match[1] : undefined
}
