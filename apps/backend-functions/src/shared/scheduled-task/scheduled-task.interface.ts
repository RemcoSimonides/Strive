interface ScheduledTaskBase {
  worker: enumWorkerType;
  performAt: FirebaseFirestore.FieldValue | string | Date;
  status: 'scheduled' | 'complete' | 'error';
}

export type ScheduledTask =
  | ScheduledTaskGoalInviteLinkDeadline
  | ScheduledTaskMilestoneDeadline
  | ScheduledTaskGoalDeadline
  | ScheduledTaskUserExerciseAffirmations

export enum enumWorkerType {
  deleteInviteTokenGoal = 'deleteInviteLinkGoal',
  milestoneDeadline = 'milestoneDeadline',
  goalDeadline = 'goalDeadline',
  userExerciseAffirmation = 'userExerciseAffirmation',
  userExerciseDailyGratefulnessReminder = 'userExerciseDailyGratefulnessReminder',
}

export interface ScheduledTaskGoalInviteLinkDeadline extends ScheduledTaskBase {
  options: {
    goalId: string;
    inviteTokenId: string;
  };
}

export interface ScheduledTaskMilestoneDeadline extends ScheduledTaskBase {
  options: {
    goalId: string;
    milestoneId: string;
  };
}

export interface ScheduledTaskGoalDeadline extends ScheduledTaskBase {
  options: {
    goalId: string;
  };
}

export interface ScheduledTaskUserExerciseAffirmations extends ScheduledTaskBase {
  options: {
    userId: string;
  };
}

export interface ScheduledTaskUserExerciseDailyGratefulness extends ScheduledTaskBase {
  options: {
    userId: string;
  };
}
