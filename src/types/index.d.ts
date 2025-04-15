declare global {
  export interface MessageChunk {
    list: MessageModel[];
    count: number;
    loadNext: () => Promise<CommentChunk>;
    isFinal: boolean;
  }
}

export {};
