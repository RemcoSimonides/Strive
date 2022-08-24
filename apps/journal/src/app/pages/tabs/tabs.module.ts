import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { RouterModule } from '@angular/router'
import { IonicModule } from '@ionic/angular'

import { TabsComponent } from './tabs.component'

import { ImageModule } from '@strive/media/directives/image.module';

@NgModule({
    imports: [
        CommonModule,
        IonicModule,
        ImageModule,
        RouterModule
    ],
    declarations: [
        TabsComponent
    ]
})
export class TabsModule {}