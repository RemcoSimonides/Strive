import { Timestamp } from '@firebase/firestore-types';
import { NotificationSupport, Support } from '@strive/support/+state/support.firestore'
import { GoalLink } from '@strive/goal/goal/+state/goal.firestore';
import { MilestoneLink } from '@strive/goal/milestone/+state/milestone.firestore';
import { UserLink } from '@strive/user/user/+state/user.firestore';
import { Comment } from '@strive/discussion/+state/comment.firestore';

export enum enumEvent {
  // 200000 -> 299999 = goal events
  gNew = 200001, //deprecated
  gNewBucketlist = 200010,
  gNewActive = 200011,
  gNewFinished = 200012,
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
}

/**
 * type feed - Shows up on the feed
 * type notification - Shows up on the notifications page
 */
export type NotificationTypes = 'feed' | 'notification';
export type NotificationMeta = SupportDecisionMeta;

// Firestore docs
// export type SupportDecisionNotification = Notification<SupportDecisionMeta>

export interface Notification<Meta extends NotificationMeta = any> {
  id?: string; // only pass id if it needs a specific id
  discussionId: string;
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
  user?: UserLink,
  goal?: GoalLink;
  milestone?: MilestoneLink,
  postId?: string;
  support?: Support;
  comment?: Comment;
}

interface MetaBase {
  type: 'supportDecision';
}

// defines the path to the post
export interface SupportDecisionMeta extends MetaBase {
  type: 'supportDecision';
  status: 'pending' | 'finalized';
  supports: NotificationSupport[]; // all supports that need to be decided within this notification
}

export interface NotificationMessageText {
  text: string;
  link?: string;
}
