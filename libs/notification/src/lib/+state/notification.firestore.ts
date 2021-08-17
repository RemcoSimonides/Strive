import { Timestamp } from '@firebase/firestore-types';
import { NotificationSupport, Support } from '@strive/support/+state/support.firestore'
import { Discussion } from '@strive/discussion/+state/discussion.firestore';
import { GoalLink } from '@strive/goal/goal/+state/goal.firestore';
import { MilestoneLink } from '@strive/milestone/+state/milestone.firestore';
import { ProfileLink } from '@strive/user/user/+state/user.firestore';
import { CollectiveGoalLink } from '@strive/collective-goal/collective-goal/+state/collective-goal.firestore';
import { TemplateLink } from '@strive/template/+state/template.firestore';
import { BucketListItem } from '@strive/exercises/bucket-list/+state/bucket-list.firestore';
import { Comment } from '@strive/discussion/+state/comment.firestore';

export enum enumEvent {
  // 100000 -> 199999 = collective goal events
  cgCreated = 100001,
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
  gMilestoneDeadlinePassed = 201010,
  gStakeholderAchieverAdded = 202001,
  gStakeholderAchieverRemoved = 202002,
  gStakeholderAdminAdded = 202003,
  gStakeholderAdminRemoved = 202004,
  gStakeholderSupporterAdded = 202005,
  gStakeholderSupporterRemoved = 202006,
  gStakeholderRequestToJoinPending = 202101,
  gStakeholderRequestToJoinAccepted = 202102,
  gStakeholderRequestToJoinRejected = 202103,
  gSupportAdded = 203010,
  gSupportWaitingToBePaid = 203020,
  gSupportPaid = 203030,
  gSupportRejected = 203040,
  gSupportPendingSuccesful = 203050, // succeeded achieving objective
  gSupportPendingFailed = 203051, // failed achieving objective
  gSupportDeleted = 203060,
  gNewPost = 205001,
  // 300000 -> 399999 = discussion events
  discussionNewMessage = 300000,
  // 400000 -> 499999 = user events
  userSpectatorAdded = 400001,
  userSpectatorRemoved = 400002,
      // 420000 -> 429999 = exercise events
  userExerciseBucketListCreated = 420000,
  userExerciseBucketListItemsAdded = 420001,
  userExerciseBucketListItemCompleted = 420002,
  userExerciseBucketListYearlyReminder = 420003
}

/**
 * type feed - Shows up on the feed
 * type notification - Shows up on the notifications page
 */
export type NotificationTypes = 'feed' | 'notification';
export type NotificationMeta = SupportDecisionMeta | GoalRequest | {};

// Firestore docs
// export type SupportDecisionNotification = Notification<SupportDecisionMeta>
// export type GoalRequestNotification = Notification<GoalRequest>

export interface Notification<Meta extends NotificationMeta = any> {
  id?: string; // only pass id if it needs a specific id
  discussionId: string;
  discussion?: Discussion; // only used to join discussion data with this data
  type: NotificationTypes;
  target: 'spectator' | 'stakeholder' | 'user' | 'goal'
  event: enumEvent;
  source: Source; // add all information you have :)
  isRead: boolean;
  needsDecision: boolean;
  meta: Meta;
  updatedAt?: Timestamp;
  createdAt?: Timestamp;
}

// add all information you have :)
export interface Source {
  user?: ProfileLink,
  goal?: GoalLink;
  milestone?: MilestoneLink,
  collectiveGoal?: CollectiveGoalLink,
  template?: TemplateLink;
  postId?: string;
  support?: Support;
  bucketList?: BucketListItem[];
  comment?: Comment;
}

interface MetaBase {
  type: 'supportDecision' | 'goalRequest';
}

// defines the path to the post
export interface SupportDecisionMeta extends MetaBase {
  type: 'supportDecision';
  status: 'pending' | 'finalized';
  supports: NotificationSupport[]; // all supports that need to be decided within this notification
}

export interface GoalRequest extends MetaBase {
  type: 'goalRequest';
  uidRequestor: string;
  status: 'open' | 'accepted' | 'rejected';
}

export interface NotificationMessageText {
  text: string;
  link?: string;
}
