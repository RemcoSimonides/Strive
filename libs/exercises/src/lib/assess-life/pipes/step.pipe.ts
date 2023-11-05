import { Pipe, PipeTransform } from '@angular/core'
import { AssessLifeQuestionConfig, EntryStep } from '@strive/model'

@Pipe({ name: 'stepFilter', standalone: true })
export class AssessLifeStepFilterPipe implements PipeTransform {

  transform(questions: AssessLifeQuestionConfig[] | null, { step, tense }: EntryStep): AssessLifeQuestionConfig[] {
    if (!questions) return []
    return questions.filter(question => question.step === step && question.tense === tense)
  }
}