<div
  class="comment"
  class:comment--reply={reply}
  class:comment--has-comments={comment.replies.length > 0}
>
  <div class="comment__body">
    <VkAvatar
      class="comment__avatar"
      id={ comment.user?.id || comment.channel.id }
    />
    <svelte:element
      this={ comment.user?.url || comment.channel?.url ? 'a' : 'span' }
      class="comment__name"
      href="{comment.user?.url || comment.channel?.url}"
    >
      { comment.user?.fullName || comment.channel.title }
    </svelte:element>

    <div class="comment__message">
      { comment.message }

      <Attachments class="comment__attachment" post={ comment } small />
    </div>

    <div class="comment__meta">
      { comment.date.toLocaleString() }
    </div>
  </div>

  {#if comment.replies.length > 0}
    <div class="comment__replies" style:--depth={depth}>
      {#each comment.replies as c }
        <Comment comment={c} depth={depth + 1} reply />
      {/each}
    </div>
  {/if}
</div>

<script lang="ts">
  import Comment from './Comment.svelte';
  import type { MessageModel } from "$models/message.model";
  import VkAvatar from "./VkAvatar.svelte";
  import Attachments from './Attachments.svelte';

  interface Props {
    comment: MessageModel;
    depth?: number;
    reply?: boolean;
  }

  let { comment, depth = 0, reply = false }:Props = $props();
</script>

<style lang="scss">
  .comment {
    display: flex;
    flex-direction: column;
    padding: var(--gap) 0;
    gap: var(--gap);

    &:not(&--reply) {
      border-bottom: 1px solid var(--color-border);
    }

    &--has-comments {
      grid-template-areas: 
        "avatar name" 
        "avatar message"
        "replies replies";
    }

    &--reply {
      padding-left: var(--gap);
    }

    :global &__avatar {
      width: 32px;
      height: 32px;
      grid-area: avatar;
    }

    :global &__attachment {
      margin-top: var(--gap);
    }

    &__body {
      display: grid;
      gap: var(--gap-small);
      grid-template-columns: 32px 1fr;
      grid-template-areas: 
        "avatar name" 
        "avatar message"
        "avatar meta";
    }

    &__meta {
      grid-area: meta;
      color: var(--color-gray);
    }

    &__name {
      grid-area: name;
      font-weight: bold;
      color: var(--color-main);
    }

    &__message {
      grid-area: message;
      color: var(--color-text);
    }

    &__replies {
      grid-area: replies;
      border-top: 1px solid var(--color-border);
      padding-left: 5px;
      border-left: 1px solid var(--color-main);
    }
  }
</style>
