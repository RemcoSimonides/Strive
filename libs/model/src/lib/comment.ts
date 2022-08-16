import { CommentSource, createCommentSource } from './notification';

export interface Comment {
    id: string;
    text: string;
    source: CommentSource;
    createdAt: Date;
    updatedAt: Date;
}

export function createComment(params: Partial<Comment> = {}): Comment {
  return {
    id: '',
    text: '',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...params,
    source: createCommentSource(params?.source),
  }
}