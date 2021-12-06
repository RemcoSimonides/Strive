import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, QueryList, ViewChildren } from '@angular/core';
// Ionic
import { AlertController } from '@ionic/angular';
// Services
import { ScreensizeService } from '@strive/utils/services/screensize.service';
// Interfaces
import { MilestoneTemplate } from '@strive/milestone/+state/milestone.firestore'
import { Goal } from '@strive/goal/goal/+state/goal.firestore'
import { getNrOfDotsInSeqno } from '@strive/milestone/+state/milestone.model';
import { MilestoneService } from '@strive/milestone/+state/milestone.service';
import { FormArray } from '@angular/forms';
import { MilestoneTemplateForm } from '@strive/milestone/forms/milestone.form';
import { Observable } from 'rxjs';

@Component({
  selector: '[mode][roadmapObservable] strive-edit-roadmap',
  templateUrl: './edit-roadmap.component.html',
  styleUrls: ['./edit-roadmap.component.scss'],
})
export class EditRoadmapComponent implements OnInit {

  @ViewChildren('datetime') dateControllers: QueryList<any>;

  milestoneForm = new MilestoneTemplateForm()
  roadmapForm = new FormArray([])

  private prevSeqNo: string
  private prevMilestoneIndex: number

  @Input() mode: 'create' | 'update'
  @Input() roadmapObservable: Observable<MilestoneTemplate[]>
  @Input() goalId: string

  @Output() onSave = new EventEmitter<MilestoneTemplate[]>()
  @Output() onCancel = new EventEmitter()

  constructor(
    private alertCtrl: AlertController,
    private cdr: ChangeDetectorRef,
    private milestoneService: MilestoneService,
    public screensize: ScreensizeService
  ) {}

  ngOnInit() {
    this.roadmapObservable.subscribe(roadmap => {
      this.roadmapForm.clear()
      for (const milestoneTemplate of roadmap) {
        this.roadmapForm.push(new MilestoneTemplateForm(milestoneTemplate))
      }
      this.cdr.markForCheck();
    })

    this.setInitialSequenceNumber()
  }

  cancel() {
    this.onCancel.emit()
  }

  async presave() {
    const description = this.milestoneForm.description.value
    if (description) {
      const alert = await this.alertCtrl.create({
        header: `Milestone hasn't been added yet`,
        subHeader: `Do you want to add '${description}' to the roadmap?`,
        buttons: [
          {
            text: 'No',
            role: 'cancel'
          },
          {
            text: 'Yes, add and save',
            role: 'add'
          }
        ]
      })
      await alert.present()
      await alert.onDidDismiss().then(res => {
        if (res.role === 'add') {
          this.addMilestone()
        }
        this.onSave.emit(this.roadmapForm.value)
      })
    }
    this.onSave.emit(this.roadmapForm.value)
  }

  /**
   * SEQUENCE NUMBER LOGIC
   */
  onSequenceNumberFocus(sequenceNumber: string){
    this.prevSeqNo = sequenceNumber
    this.prevMilestoneIndex = this.roadmapForm.controls.findIndex(m => m.value.sequenceNumber === sequenceNumber)
  }

  onSequenceNumberBlur(event: CustomEvent, newSequenceNumber: string) {

    if (!this.checkSequenceNumberValidity(newSequenceNumber)){
      this.roadmapForm.controls[this.prevMilestoneIndex].get('sequenceNumber').setValue(this.prevSeqNo)
    } else {
      const from = this.prevMilestoneIndex
      const to = this.findIndexForNewSequenceNumberPosition(newSequenceNumber)

      // Reorder the array
      const temp = this.roadmapForm.at(from)
      if (!!temp) { // temp is undefined when milestone is removed
        this.roadmapForm.removeAt(from)
        this.roadmapForm.insert(to, temp)
        this.resetSequenceNumbers()
        this.determineNextSequenceNumber()
      }
    }
  }

  onSequenceNumberInput(event: CustomEvent, form: 'milestone' | 'roadmap', oldValue: string) {
    const typedValue = event.detail.data
    const control = form === 'milestone'
      ? this.milestoneForm.sequenceNumber
      : this.roadmapForm.controls[this.prevMilestoneIndex].get('sequenceNumber')

    const undo = () => {
      // Attempt to cancel the change!
      setTimeout(() => {
        control.setValue(oldValue)
      }, 0);
    }

    if (event.detail.inputType === 'insertText') {
      if (typedValue === '.') {
        // Only dot is allowed other than number but only one in a row
        if (oldValue.endsWith('.')) {
          undo()
        }

      } else if (!isNaN(typedValue)) { 
        const valueToBeChecked: string = !oldValue ? typedValue : `${oldValue}${typedValue}`

        if (!this.checkSequenceNumberValidity(valueToBeChecked)){
          if (typedValue === '1') {
            oldValue = oldValue.slice(0, -1)
          }
          undo()
          return
        }
      } else {
        undo()
        return
      }
    }
  }

  addMilestone() {
    if (this.milestoneForm.invalid) return

    const { sequenceNumber, description } = this.milestoneForm.value as MilestoneTemplate

    //Prevent adding invalid sequence number
    if (!this.checkSequenceNumberValidity(sequenceNumber)) return

    const id = this.milestoneService.createId()
    const indexForNewMilestone = this.findIndexForNewSequenceNumberPosition(sequenceNumber)
    const control = new MilestoneTemplateForm({ id, sequenceNumber, description })
    this.roadmapForm.insert(indexForNewMilestone, control)

    this.resetSequenceNumbers()

    this.milestoneForm.incrementSeqNo(1)
    this.milestoneForm.description.reset()
  }

  async deleteMilestone(sequenceNumber: string): Promise<void> {
    const index = this.roadmapForm.controls.findIndex(control => control.value.sequenceNumber === sequenceNumber)

    const deleteMilestone = () => {
      this.roadmapForm.removeAt(index)
      this.resetSequenceNumbers()
      this.milestoneForm.incrementSeqNo(-1)
    }

    // check if milestone has supports -> then give a warning. Supports will be deleted if deleted
    if (this.goalId) {
      const milestoneId = this.roadmapForm.controls[index].value.id as string
      const milestone = await this.milestoneService.getValue(milestoneId, { goalId: this.goalId });
  
      if (milestone?.numberOfMoneySupports > 0 || milestone?.numberOfCustomSupports > 0) {
  
        const alert = await this.alertCtrl.create({
          header: `Milestone has active supports`,
          subHeader: `Are you sure you want to delete it?`,
          buttons: [
            {
              text: 'Cancel',
              role: 'cancel'
            },
            {
              text: 'Delete',
              role: 'delete'
            }
          ]
        });
        await alert.present();
        await alert.onDidDismiss().then((res) => {
          if (res.role == 'delete') {
            deleteMilestone()
          }
        })
  
      } else  {
        deleteMilestone()
      }
    } else {
      deleteMilestone()
    }
  }

  private setInitialSequenceNumber() {
    if (!!this.roadmapForm.controls.length) {
      const lastIndex = this.roadmapForm.controls.length - 1
      const lastSeqno = this.roadmapForm.controls[lastIndex].value.sequenceNumber
      const nextSeqno = this.incrementSeqNo(lastSeqno, 1)
      this.milestoneForm.sequenceNumber.setValue(nextSeqno)
    }
  }

  private incrementSeqNo(sequenceNumber: string, delta: number): string {
    const elements = sequenceNumber.split('.')
    const last = elements.pop()
    elements.push((+last + delta).toString())
    return elements.join('.')
  }

  private findIndexForNewSequenceNumberPosition(sequenceNumber: string): number {
    if (sequenceNumber === '1' && this.roadmapForm.controls.length === 0) return 0

    //Check for equal to existing milestone
    const index = this.roadmapForm.controls.findIndex(ctrl => ctrl.value.sequenceNumber === sequenceNumber)
    if (index > -1) return index

    //Need to determine new sequence number
    const elements = sequenceNumber.split('.')
    switch (elements.length) {
      case 1:
        return this.roadmapForm.controls.length
      case 2: {
        const parentSeqNo = elements[0]
        const i = this.roadmapForm.controls.findIndex(ctrl => ctrl.value.sequenceNumber === this.incrementSeqNo(parentSeqNo, 1))
        return i === -1 ? this.roadmapForm.controls.length : i
      }
      case 3: {
        const parentSeqNo = `${elements[0]}.${elements[1]}`
        const index = this.roadmapForm.controls.findIndex(ctrl => ctrl.value.sequenceNumber === this.incrementSeqNo(parentSeqNo, 1))
        if (index === -1) {
          const parentOfParentSeqNo = elements.shift()
          const i = this.roadmapForm.controls.findIndex(ctrl => ctrl.value.sequenceNumber === this.incrementSeqNo(parentOfParentSeqNo, 1))
          return i === -1 ? this.roadmapForm.controls.length : i
        }
        return index
      }
      default: return 0
    }
  }

  private checkSequenceNumberValidity(sequenceNumber: string): boolean {

    //Check type
    if (typeof sequenceNumber !== 'string') return false

    const elements = sequenceNumber.split('.')

    //Cannot contain more than three elements / two dots
    if (elements.length > 3) return false

    //Check seqno syntax and length
    if (elements.some(seqNo => !seqNo || isNaN(+seqNo) || +seqNo <= 0)) return false

    //Has to be 1 if there are no milestones yet
    if (this.roadmapForm.controls.length === 0 && sequenceNumber !== '1') return false
    if (this.roadmapForm.controls.length === 0 && sequenceNumber === '1') return true

    //Can only be equal or one bigger than the previous one
    //Check equal
    if (this.roadmapForm.controls.some(ctrl => ctrl.value.sequenceNumber === sequenceNumber)) return true

    //Check if one bigger
    const last = elements.pop()
    if (last === '1') {
      const parentSeqNo = elements.join('.')
      return this.roadmapForm.controls.some(ctrl => ctrl.value.sequenceNumber === parentSeqNo)
    } else {
      const previousSeqNo = this.incrementSeqNo(sequenceNumber, -1)
      return this.roadmapForm.controls.some(ctrl => ctrl.value.sequenceNumber === previousSeqNo)
    }
  }

  private resetSequenceNumbers() {

    let counter1 = 1
    let counter2 = 1
    let counter3 = 1

    for (const ctrl of this.roadmapForm.controls) {
      switch (getNrOfDotsInSeqno(ctrl.value.sequenceNumber)) {
        //Level one milestone
        case 0:
          ctrl.get('sequenceNumber').setValue(`${counter1}`)
          counter1++
          counter2 = 1
          counter3 = 1
          break
        //Level two milestone
        case 1:
          ctrl.get('sequenceNumber').setValue(`${counter1 - 1}.${counter2}`)
          counter2++
          counter3 = 1
          break
        //Level three milestone
        case 2:
          if (counter2 === 1) {
            // This is triggered when the milestone above is two levels above the new one. Then the (current) seqno gets converted to a level 2 instead of level 3
            // Counter would otherwise already have been increased by 1 in the previous case
            ctrl.get('sequenceNumber').setValue(`${counter1 - 1}.${counter2}`)
            counter2++
            counter3 = 1

          } else {
            ctrl.get('sequenceNumber').setValue(`${counter1 - 1}.${counter2 - 1}.${counter3}`)
            counter3++
          }
          break
      }
    }
  }

  private determineNextSequenceNumber() {
    const roadmapTemplate: MilestoneTemplate[] = this.roadmapForm.value
    const elements = this.milestoneForm.sequenceNumber.value.split('.')

    let siblings
    if (elements.length > 2) {
      elements.pop()
      const pre = elements.join('.') + '.'
      siblings = roadmapTemplate.filter(m => m.sequenceNumber.includes(pre))
    }

    if (!siblings?.length) elements.pop()

    if (elements.length > 1) {
      elements.pop();
      const pre = elements.join('.') + '.'
      siblings = roadmapTemplate.filter(m => m.sequenceNumber.includes(pre))
    }
    
    if (!siblings?.length) {
      elements.pop()
      siblings = roadmapTemplate.filter(m => getNrOfDotsInSeqno(m.sequenceNumber) === 0)
    }

    const nextSeqno = this.incrementSeqNo(siblings.pop().sequenceNumber, 1)
    this.milestoneForm.sequenceNumber.setValue(nextSeqno)
  }

  getMargin(sequenceNumber: string): string {
    const numberOfDots = getNrOfDotsInSeqno(sequenceNumber)
    return (numberOfDots * 10).toString() + 'px'
  }

  openDateTime(index: number) {
    const control = this.dateControllers.get(index)
    control.open()
  }

  openingDatetime($event, milestone: MilestoneTemplate) {
    event.stopPropagation(); //prevents roadmap from collapsing in or out :)

    // empty value
    $event.target.value = ""

    // set min
    $event.target.min = new Date().toISOString()

    // set max
    // if (this.goal.deadline) $event.target.max = this.goal.deadline

    const elements = milestone.sequenceNumber.split('.')
    if (elements.length !== 1) {
      // if milestone is a submilestone, then max date cannot be later than parent milestone deadline
      elements.pop()
      const parentSeqNo = elements.join('.')
      const rodmapTemplate: MilestoneTemplate[] = this.roadmapForm.value;
      const parent = rodmapTemplate.find(milestone => milestone.sequenceNumber === parentSeqNo)
      if (parent.deadline) $event.target.max = parent.deadline
    }
  }
}
