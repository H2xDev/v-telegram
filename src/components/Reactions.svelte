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
    flex-wrap: wrap-reverse;
    justify-content: flex-end;
    gap: var(--gap-small);
    color: var(--color-main);

    &__icon {
      position: relative;
      display: inline-block;
      font-size: 12px;
      filter: sepia(1) hue-rotate(180deg) brightness(0.9);
    }

    &:has(&__item:hover) &__item {
      opacity: 0.3;
    }

    &__item {
      display: flex;
      align-items: center;
      cursor: pointer;
      transition: 0.2s;
      flex-shrink: 0;
      font-weight: 700;
      gap: 2px;
      font-size: 10px;
      border-radius: var(--corners);
      padding: 2px;
      padding-right: 5px;

      &:hover {
        opacity: 1 !important;
        background-color: var(--color-main-light);
      }
    }
  }
</style>
