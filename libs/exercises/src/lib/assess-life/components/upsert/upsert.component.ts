import { Component, HostBinding, HostListener, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'exercise-assess-life',
  templateUrl: './upsert.component.html',
  styleUrls: ['./upsert.component.scss']
})
export class AssessLifeUpsertComponent implements OnInit {
  @HostListener('window:popstate', ['$event'])
  onPopState() {
    this.modalCtrl.dismiss()
  }
  @HostBinding() modal: HTMLIonModalElement


  constructor(
    private location: Location,
    private modalCtrl: ModalController
  ) {
    window.history.pushState(null, null, window.location.href)
  }

  ngOnInit() {
    this.modal.onWillDismiss().then(res => {
      if (res.role === 'backdrop') this.location.back()
    })
  }

  dismiss() {
    this.location.back()
  }
}
