import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
// Custom pipes
import { MilestonePathPipe } from './milestone-path/milestone-path.pipe';

@NgModule({
    imports: [
        CommonModule
    ],
    declarations: [
        MilestonePathPipe,
    ],
    exports: [
        MilestonePathPipe
    ]
})
export class PipesModule {}