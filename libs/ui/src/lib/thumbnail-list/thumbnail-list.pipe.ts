import { NgModule, Pipe, PipeTransform } from '@angular/core';
import { ICollectiveGoal, IGoal, ITemplate } from '@strive/interfaces';
import { IThumbnail } from './thumbnail-list.component'

@Pipe({ name: 'toThumbnailList' })
export class ThumbnailListPipe implements PipeTransform {
  transform(data: ICollectiveGoal[] | IGoal[] | ITemplate[], type: 'collectiveGoal' | 'goal' | 'template') {
    if (!data) return [];
    switch (type) {
      case 'collectiveGoal':
        return (data as ICollectiveGoal[]).map(cg => {
          return {
            id: cg.id,
            title: cg.title,
            image: cg.image,
            // isPublic: cg.isPublic,
            // numberOfAchievers: cg.numberOfAchievers,
            deadline: cg.deadline,
            ...cg
          } as Partial<IThumbnail>
        })

      case 'goal':
        return (data as IGoal[]).map(g => {
          return {
            id: g.id,
            title: g.title,
            image: g.image,
            isFinished: g.isFinished,
            // TODO find out how to set isPublic nicely
            // isPublic: g.publicity === enumGoalPublicity.public,
            // numberOfAchievers: g.numberOfAchievers,
            // numberOfSupporters: g.numberOfSupporters,
            // deadline: g.deadline
            ...g
          } as Partial<IThumbnail>
        })
      
      case 'template':
        return (data as ITemplate[]).map(t => {
          return {
            id: t.id,
            title: t.title,
            image: t.goalImage,
            ...t
          } as Partial<IThumbnail>
        })
    
      default:
        
        break;
    }

  }
}

@NgModule({
  declarations: [ThumbnailListPipe],
  exports: [ThumbnailListPipe]
})
export class ThumbnailListPipeModule { }