import { Timestamp } from '@firebase/firestore-types';

export enum enumPostSource {
    milestone,
    goal,
    collectiveGoal,
    custom
}

export interface Post {
    id?: string;
    isEvidence: boolean;
    author: {
        id: string;
        username: string;
        profileImage: string;
    };
    content: {
        title: string;
        description: string;
        mediaURL?: string;
    };
    goal: {
        id: string;
        title: string;
        image: string;
    };
    milestone: {
        id: string;
        description: string;
    };
    likes: { [uid: string]: true };
    updatedAt?: Timestamp;
    createdAt?: Timestamp;
}
