import { Pipe, PipeTransform } from '@angular/core'
import { AssessLifeQuestion, Step } from '@strive/model'

@Pipe({ name: 'stepFilter', standalone: true })
export class AssessLifeStepFilterPipe implements PipeTransform {

  transform(questions: AssessLifeQuestion[] | null, step: Step): AssessLifeQuestion[] {
    if (!questions) return []
    return questions.filter(question => question.step === step)
  }
}