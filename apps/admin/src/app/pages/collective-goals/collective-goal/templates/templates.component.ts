import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { Template } from '@strive/template/+state/template.firestore';
import { TemplateService } from '@strive/template/+state/template.service';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';


@Component({
  selector: '[id] strive-templates',
  templateUrl: './templates.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TemplatesComponent implements OnInit {

	templates$: Observable<Template[]>

	@Input() id: string

  constructor(
    private template: TemplateService
  ) {}

	ngOnInit() {
    this.templates$ = this.template.valueChanges({ collectiveGoalId: this.id }).pipe(
      tap(console.log)
    )
	}
}
