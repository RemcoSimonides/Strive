interface ScheduledTaskBase {
  worker: enumWorkerType;
  performAt: FirebaseFirestore.FieldValue | string;
  status: 'scheduled' | 'complete' | 'error';
}

export type ScheduledTask =
  | ScheduledTaskGoalInviteLinkDeadline
  | ScheduledTaskCollectiveGoalInviteLinkDeadline
  | ScheduledTaskNotificationDeadline
  | ScheduledTaskMilestoneDeadline
  | ScheduledTaskGoalDeadline
  | ScheduledTaskCollectiveGoalDeadline
  | ScheduledTaskUserExerciseAffirmations
  | ScheduledTaskUserExerciseBucketList;

export enum enumWorkerType {
  deleteInviteTokenGoal = 'deleteInviteLinkGoal',
  deleteInviteTokenCollectiveGoal = 'deleteInviteLinkCollectiveGoal',
  notificationEvidenceDeadline = 'notificationEvidenceDeadline',
  milestoneDeadline = 'milestoneDeadline',
  goalDeadline = 'goalDeadline',
  collectiveGoalDeadline = 'collectiveGoalDeadline',
  userExerciseAffirmation = 'userExerciseAffirmation',
  userExerciseBucketListYearlyReminder = 'userExerciseBucketListYearlyReminder',
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

export interface ScheduledTaskNotificationDeadline extends ScheduledTaskBase {
  options: {
    userId: string;
    notificationId: string;
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

export interface ScheduledTaskUserExerciseBucketList extends ScheduledTaskBase {
  options: {
    userId: string;
  };
}

export interface ScheduledTaskUserExerciseDailyGratefulness extends ScheduledTaskBase {
  options: {
    userId: string;
  };
}
