import { Timestamp } from '@firebase/firestore-types';
import { INotificationSupport } from './support.interface';
import { IDiscussion } from './discussion.interface';

export type INotification = INotificationBase | INotificationWithPost | INotificationWithPostAndSupports | INotificationGoalRequest;

export enum enumNotificationType {
    general,
    evidence_pending,
    evidence_finalized,
    post,
    goal_request_to_join
}

export enum enumEvent {
    // 100000 -> 199999 = collective goal events
    cgAdded = 100001,
    cgUpdated = 100002,
    cgDeleted = 100003,
    cgFinished = 100004,
    cgTitleUpdated = 101001,
    cgImageUpdated = 101002,
    cgShortDescriptionUpdated = 101003,
    cgDescriptionUpdated = 101004,
    cgDeadlineAdded = 101005,
    cgDeadlinePassed = 101005,
    cgDeadlineRemoved = 101007,
    // cgGoalAdded = 101001, // maybe in future when you can add an existing goal to a collective goal
    cgGoalCreated = 101002,
    cgGoalFinised = 101003,
    cgGoalRemoved = 101004,
    cgStakeholderAchieverAdded = 102001,
    cgStakeholderAchieverRemoved = 102002,
    cgStakeholderAdminAdded = 102003,
    cgStakeholderAdminRemoved = 102004,
    cgStakeholderSpectatorAdded = 102005,
    cgStakeholderSpectatorRemoved = 102006,
    cgTemplateAdded = 103001,
    cgTemplateUpdated = 103002,
    cgTemplateRoadmapUpdated = 103002,
    // 200000 -> 299999 = goal events
    gNew = 200001,
    gFinished = 200002,
    gUpdated = 200003,
    gRoadmapUpdated = 204001,
    gMilestoneCompletedSuccessfully = 201001,
    gMilestoneCompletedUnsuccessfully = 201002,
    gStakeholderAchieverAdded = 202001,
    gStakeholderAchieverRemoved = 202002,
    gStakeholderAdminAdded = 202003,
    gStakeholderAdminRemoved = 202004,
    gStakeholderSupporterAdded = 202005,
    gStakeholderSupporterRemoved = 202006,
    gStakeholderRequestToJoinPending = 202101,
    gStakeholderRequestToJoinAccepted = 202102,
    gStakeholderRequestToJoinRejected = 202103,
    gSupportAdded = 203001,
    gSupportWaitingToBePaid = 203002,
    gSupportPaid = 203003,
    gSupportRejected = 203004,
    gSupportStatusChangedToPending = 203005,
    gSupportDeleted = 203006,
    gNewPost = 2050001,
    // 300000 -> 399999 = discussion events
    discussionNewMessage = 300000,
    // 400000 -> 499999 = user events
    userSpectatorAdded = 400001,
    userSpectatorRemoved = 400002,
        // 420000 -> 429999 = exercise events
    userExerciseBucketListCreated = 420000,
    userExerciseBucketListItemAdded = 420001,
    userExerciseBucketListItemCompleted = 420002,
    userExerciseBucketListYearlyReminder = 420003

}

export interface INotificationBase {
    id?: string; // only pass id if it needs a specific id
    discussionId: string; // mandatory
    discussion?: IDiscussion; // only used to join discussion data with this data
    message: INotificationMessageText[]; // mandatory
    notificationType: enumNotificationType; // if notification type is not 'general', then define what it is
    event: enumEvent; // mandatory
    source: ISource; // add all information you have :)
    isRead: boolean; // added automatically
    updatedAt?: Timestamp; // added automatically
    createdAt?: Timestamp; // added automatically
}

export interface ISource {
    image: string;
    name: string;
    goalId?: string;
    milestoneId?: string;
    postId?: string;
    supportId?: string;
    collecetiveGoalId?: string;
    templateId?: string;
    userId?: string;
}// add all information you have :)

export interface INotificationWithPost extends INotificationBase {
    path: {
        collectiveGoalId?: string;
        goalId?: string;
        postId?: string;
    }; // defines the path to the post
}

export interface INotificationWithPostAndSupports extends INotificationWithPost {
    deadline: string; // deadline for when decision needs to be made
    supports: INotificationSupport[]; // all supports that need to be decided within this notification
}

export interface INotificationGoalRequest extends INotificationBase {
    requestPath: {
        collectiveGoalId?: string;
        goalId?: string;
        uidRequestor?: string;
    };
    requestStatus: enumRequestStatus;
}

export interface INotificationMessageText {
    text: string;
    link?: string;
}

export enum enumRequestStatus {
    open,
    accepted,
    rejected
}
