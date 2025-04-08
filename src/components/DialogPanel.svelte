<div class="dialog" class:dialog--unread={dialog.unreadCount}>
  <Avatar class="dialog__avatar" id={`${dialog.id}`} />
  <div class="dialog__info">
    <a class="dialog__name" href="/{dialog.user.username || dialog.user.id}">{dialog.title}</a>
    <div class="dialog__online-status"></div>
    <div class="dialog__date">{dialog.lastMessage.date.toLocaleDateString()}</div>
  </div>
  <a class="dialog__last-message" href="/messages/{dialog.user.username || `${dialog.id}`}">
    {@html dialog.lastMessage.message || '' }...
  </a>

  {#if dialog.unreadCount > 0}
  <div class="dialog__unread-messages">
    +{dialog.unreadCount}
  </div>
  {/if}
</div>

<script lang="ts">
  import type { DialogModel } from "../models/dialog.model";
  import Avatar from "./Avatar.svelte";

  interface Props {
    dialog: DialogModel;
  }

  let { dialog }: Props = $props();

</script>

<style lang="scss">
  .dialog {
    width: 100%;
    border-bottom: 1px solid var(--color-border);
    padding: var(--gap);
    box-sizing: border-box;
    color: var(--color-secondary);
    display: flex;
    gap: var(--gap);
    align-items: center;

    &:hover {
      background-color: var(--color-bg);
    }

    &--unread {
      background-color: var(--color-light);
    }

    :global &__avatar {
      font-size: 0;
      position: relative;
      width: 55px;
      height: 55px;
      border-radius: 4px;
    }

    &__info {
      margin-right: 70px;
      min-width: 120px;
      max-width: 120px;
      flex-shrink: 0;
    }

    &__name {
      color: var(--color-main);
    }

    &__last-message {
      color: var(--color-main);
      display: -webkit-box;
      flex: auto;
      max-width: 320px;
      overflow: hidden;
      text-overflow: ellipsis;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }

    &__date {
      font-size: 11px;
    }

    &__unread-messages {
      font-size: 12px;
      font-weight: bold;
      background-color: #D2DBE2;
      color: var(--color-main);
      padding: 3px var(--gap-small);
      border-radius: 2px;
    }
  }
</style>
