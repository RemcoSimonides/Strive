import { FieldValue } from '@firebase/firestore-types';

export interface ISupport {
    id?: string;
    amount?: number;
    description: string;
    status: enumSupportStatus;
    goal: {
        id: string;
        title: string;
        image: string;
    };
    milestone?: {
        id: string;
        description: string;
    };
    path?: {
        level1id: string;
        level1description: string;
        level2id: string;
        level2description: string;
        level3id: string;
        level3description: string;
    };
    supporter: {
        uid: string;
        username: string;
        photoURL: string;
    };
    receiver?: {
        uid: string;
        username: string;
        photoURL: string;
    };
    updatedAt?: FieldValue;
    createdAt?: FieldValue;
}

export interface INotificationSupport {
    id: string;
    description: string;
    decision: enumSupportDecision;
    milestoneIsFinished: boolean;
    receiverId?: string;
    receiverUsername?: string;
    receiverPhotoURL?: string;
}

export enum enumSupportStatus {
    open,
    rejected,
    waiting_to_be_paid,
    paid,
    waiting_for_receiver,
}

export enum enumSupportDecision {
    give,
    keep
}
