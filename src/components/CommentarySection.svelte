<div class="commentaries">
  <div 
    class="commentaries__list"
    class:commentaries__list--hidden={hidden}
  >
    {#each comments as comment }
      <Comment { comment } />
    {/each}
  </div>

  {#if !isAllOpened}
    <button
      class="commentaries__button"
      onclick={loadComments}
      disabled={isLoading}
    >
      {#if isLoading}
        <VkSpinner />
      {:else}
        Show { post.commentariesCount - loadedCount } comments
      {/if}
    </button>
  {/if}
</div>

<script lang="ts">
  import type { MessageModel } from "$models/message.model";
  import { ChannelService, type CommentChunk } from "@/lib/channel.service";
  import Comment from "./Comment.svelte";
  import VkSpinner from "./VkSpinner.svelte";

  interface Props {
    post: MessageModel;
  }

  const channelService = new ChannelService();

  let { post }: Props = $props();
  let comments: MessageModel[] = $state([]);
  let loadedCount = $state(0);
  let loadNext: CommentChunk["loadNext"] = () => channelService.getComments(post);
  let isLoading = $state(false);
  let hidden = $state(false);

  const isAllOpened = $derived(post.commentariesCount - loadedCount <= 0);

  const applyList = ({ list, count, loadNext: newLoadNext }: CommentChunk) => {
    comments = [...comments, ...list];
    loadedCount += count;
    loadNext = newLoadNext;
  }

  const loadComments = () => {
    isLoading = true;
    loadNext().then(applyList).finally(() => {isLoading = false;});
  };
</script>

<style lang="scss">
  .commentaries {
    &__button {
      position: relative;
      display: block;
      box-sizing: border-box;
      background-color: var(--color-bg);
      color: var(--color-main);
      padding: var(--gap);
      border: 0;
      font: inherit;
      width: 100%;
      cursor: pointer;
      z-index: 2;
      border-radius: var(--border-radius);

      &:hover {
        background-color: var(--color-main-light);
      }

      &--top {
        position: sticky;
        top: calc(var(--header-height) + var(--gap));
        z-index: 1;
      }
    }

    &__list {
      display: flex;
      flex-direction: column;
      list-style: none;
      padding: 0;
      margin: 0;
    }
  }
</style>
