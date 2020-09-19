interface IScheduledTaskBase {
    worker: enumWorkerType,
    performAt: FirebaseFirestore.FieldValue | string,
    status?: enumTaskStatus,
}

export type IScheduledTask = 
    IScheduledTaskGoalInviteLinkDeadline
    | IScheduledTaskCollectiveGoalInviteLinkDeadline
    | IScheduledTaskNotificationDeadline 
    | IScheduledTaskMilestoneDeadline
    | IScheduledTaskGoalDeadline
    | IScheduledTaskCollectiveGoalDeadline
    | IScheduledTaskUserExerciseAffirmations
    | IScheduledTaskUserExerciseBucketList

export enum enumWorkerType {
    deleteInviteTokenGoal = "deleteInviteLinkGoal",
    deleteInviteTokenCollectiveGoal = "deleteInviteLinkCollectiveGoal",
    notificationEvidenceDeadline = "notificationEvidenceDeadline",
    milestoneDeadline = "milestoneDeadline",
    goalDeadline = "goalDeadline",
    collectiveGoalDeadline = "collectiveGoalDeadline",
    userExerciseAffirmation = "userExerciseAffirmation",
    userExerciseBucketListYearlyReminder = "userExerciseBucketListYearlyReminder",
    userExerciseDailyGratefulnessReminder = "userExerciseDailyGratefulnessReminder"
}

export enum enumTaskStatus {
    scheduled,
    complete,
    error
}

export interface IScheduledTaskGoalInviteLinkDeadline extends IScheduledTaskBase {
    options: {
        goalId: string;
        inviteTokenId: string;
    }
}

export interface IScheduledTaskCollectiveGoalInviteLinkDeadline extends IScheduledTaskBase {
    options: {
        collectiveGoalId: string;
        inviteTokenId: string;
    }
}

export interface IScheduledTaskNotificationDeadline extends IScheduledTaskBase {
    options: {
        userId: string;
        notificationId: string;
    }
}

export interface IScheduledTaskMilestoneDeadline extends IScheduledTaskBase {
    options: {
        goalId: string;
        milestoneId: string;
    }
}

export interface IScheduledTaskGoalDeadline extends IScheduledTaskBase {
    options: {
        goalId: string;
    }
}

export interface IScheduledTaskCollectiveGoalDeadline extends IScheduledTaskBase {
    options: {
        collectiveGoalId: string;
    }
}

export interface IScheduledTaskUserExerciseAffirmations extends IScheduledTaskBase {
    options: {
        userId: string;
    }
}

export interface IScheduledTaskUserExerciseBucketList extends IScheduledTaskBase {
    options: {
        userId: string;
    }
}

export interface IScheduledTaskUserExerciseDailyGratefulness extends IScheduledTaskBase {
    options: {
        userId: string;
    }
}