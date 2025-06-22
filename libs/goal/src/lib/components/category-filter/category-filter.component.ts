import { ChangeDetectionStrategy, Component, Input, inject } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'

import { IonList, IonItem, PopoverController } from '@ionic/angular/standalone'

import { Category, CategoryBlock, categories as categoryBlocks } from '@strive/model'

@Component({
    selector: '[goal][stakeholder] strive-category-filter',
    templateUrl: './category-filter.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        IonList,
        IonItem
    ]
})
export class CategoryFilterComponent {
  private popoverCtrl = inject(PopoverController);
  private route = inject(ActivatedRoute);
  private router = inject(Router);


  _categoryBlocks: CategoryBlock[] = []
  @Input() set categories(categories: Category[]) {
    this._categoryBlocks = categoryBlocks.filter(b => categories.includes(b.id))
  }

  all() {
    this.router.navigate(['.'], {
      relativeTo: this.route
    })
    this.popoverCtrl.dismiss()
  }

  select(category: Category) {
    this.router.navigate(['.'], {
      queryParams: { c: category },
      relativeTo: this.route
    })
    this.popoverCtrl.dismiss()
  }
}