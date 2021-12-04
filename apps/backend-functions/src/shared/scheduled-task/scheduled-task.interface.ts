interface ScheduledTaskBase {
  worker: enumWorkerType;
  performAt: FirebaseFirestore.FieldValue | string;
  status: 'scheduled' | 'complete' | 'error';
}

export type ScheduledTask =
  | ScheduledTaskGoalInviteLinkDeadline
  | ScheduledTaskCollectiveGoalInviteLinkDeadline
  | ScheduledTaskMilestoneDeadline
  | ScheduledTaskGoalDeadline
  | ScheduledTaskCollectiveGoalDeadline
  | ScheduledTaskUserExerciseAffirmations

export enum enumWorkerType {
  deleteInviteTokenGoal = 'deleteInviteLinkGoal',
  deleteInviteTokenCollectiveGoal = 'deleteInviteLinkCollectiveGoal',
  milestoneDeadline = 'milestoneDeadline',
  goalDeadline = 'goalDeadline',
  collectiveGoalDeadline = 'collectiveGoalDeadline',
  userExerciseAffirmation = 'userExerciseAffirmation',
  userExerciseDailyGratefulnessReminder = 'userExerciseDailyGratefulnessReminder',
}

export interface ScheduledTaskGoalInviteLinkDeadline extends ScheduledTaskBase {
  options: {
    goalId: string;
    inviteTokenId: string;
  };
}

export interface ScheduledTaskCollectiveGoalInviteLinkDeadline extends ScheduledTaskBase {
  options: {
    collectiveGoalId: string;
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

export interface ScheduledTaskCollectiveGoalDeadline extends ScheduledTaskBase {
  options: {
    collectiveGoalId: string;
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
