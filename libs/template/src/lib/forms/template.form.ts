import { FormEntity } from '@strive/utils/form/entity.form';
import { FormControl, Validators } from '@angular/forms'
import { createTemplate, Template } from "../+state/template.firestore";

function createTemplateFormControl(params?: Template) {
  const template = createTemplate(params)
  return {
    title: new FormControl(template.title, Validators.compose([Validators.required])),
    description: new FormControl(template.description),
    deadline: new FormControl(template.deadline),
    goalTitle: new FormControl(template.goalTitle, Validators.compose([Validators.required])),
    goalShortDescription: new FormControl(template.goalShortDescription),
    goalDescription: new FormControl(template.goalDescription),
    goalImage: new FormControl(template.goalImage),
    goalIsPublic: new FormControl(template.goalIsPublic),
    goalDeadline: new FormControl(template.goalDeadline),
    milestoneTemplateObject: new FormControl(template.milestoneTemplateObject)
  }
}

export type TemplateFormControl = ReturnType<typeof createTemplateFormControl>

export class TemplateForm extends FormEntity<TemplateFormControl> {
  constructor(template?: Template) {
    super(createTemplateFormControl(template))
  }
}