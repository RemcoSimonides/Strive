import { SelfReflectFrequencyWithNever } from "@strive/model"

interface ScheduledTaskBase {
  worker: enumWorkerType
  performAt: FirebaseFirestore.FieldValue | Date
  status: 'scheduled' | 'complete' | 'error'
}

export type ScheduledTask =
  | ScheduledTaskGoalInviteLinkDeadline
  | ScheduledTaskMilestoneDeadline
  | ScheduledTaskGoalDeadline
  | ScheduledTaskUserExerciseAffirmations
  | ScheduledTaskUserExerciseWheelOfLife

export enum enumWorkerType {
  deleteInviteTokenGoal = 'deleteInviteLinkGoal',
  milestoneDeadline = 'milestoneDeadline',
  goalDeadline = 'goalDeadline',
  userExerciseAffirmation = 'userExerciseAffirmation',
  userExerciseDailyGratitudeReminder = 'userExerciseDailyGratitudeReminder',
  userExerciseDearFutureSelfMessage = 'userExerciseDearFutureSelfMessage',
  userExerciseWheelOfLifeReminder = 'userExerciseWheelOfLifeReminder',
  userExerciseSelfReflect = 'userExerciseSelfReflect'
}

export interface ScheduledTaskGoalInviteLinkDeadline extends ScheduledTaskBase {
  options: {
    goalId: string
    inviteTokenId: string
  }
}

export interface ScheduledTaskMilestoneDeadline extends ScheduledTaskBase {
  options: {
    goalId: string
    milestoneId: string
  }
}

export interface ScheduledTaskGoalDeadline extends ScheduledTaskBase {
  options: {
    goalId: string
  }
}

export interface ScheduledTaskUserExerciseAffirmations extends ScheduledTaskBase {
  options: {
    userId: string
  }
}

export interface ScheduledTaskUserExerciseDailyGratitude extends ScheduledTaskBase {
  options: {
    userId: string
  }
}

export interface ScheduledTaskUserExerciseDearFutureSelfMessage extends ScheduledTaskBase {
  options: {
    userId: string
    index: number
  }
}

export interface ScheduledTaskUserExerciseWheelOfLife extends ScheduledTaskBase {
  options: {
    userId: string
  }
}

export interface ScheduledTaskUserExerciseSelfReflect extends ScheduledTaskBase {
  options: {
    userId: string,
    frequencies: SelfReflectFrequencyWithNever[]
  }
}