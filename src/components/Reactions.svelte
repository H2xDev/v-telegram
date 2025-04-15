<div class="reactions">
  {#each post.reactions as reaction}
    <div class="reactions__item">
      <span class="reactions__icon">{reaction.emoticon}</span>
      <span>{reaction.count}</span>
    </div>
  {/each}
</div>

<script lang="ts">
  import type { MessageModel } from "$models/message.model";

  interface Props {
    post: MessageModel
  }
  let { post }: Props = $props();
</script>


<style lang="scss">
  .reactions {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: var(--gap-small);
    color: var(--color-main);

    &__icon {
      font-size: 14px;
    }

    &:has(&__item:hover) &__item {
      opacity: 0.3;
    }

    &__item {
      display: flex;
      align-items: center;
      cursor: pointer;
      transition: 0.2s;

      &:hover {
        opacity: 1 !important;
      }
    }
  }
</style>
