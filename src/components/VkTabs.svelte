<div class="tabs">
  {#each tabs as tab, index}
    <button
      class="tabs__tab-button"
      class:tabs__tab-button--active={index === currentTab}
      onclick={() => onChangeTab?.(index)}
    >
      { tab }
    </button>
  {/each}
</div>

<script lang="ts">
  interface Props {
    tabs: string[],
    currentTab: number,
    onChangeTab: (index: number) => void
  }

  let { tabs = [], currentTab, onChangeTab }: Props = $props();
</script>

<style lang="scss">
.tabs {
  display: flex;
  padding: 0 var(--gap);
  padding-top: var(--gap);
  border-bottom: 1px solid var(--color-main);
  gap: var(--gap);
  justify-content: flex-start;
  
  &__tab-button {
    border: 0;
    border-top-left-radius: 2px;
    border-top-right-radius: 2px;
    font: inherit;
    padding: 5px 10px;
    color: var(--color-main);
    background-color: transparent;
    cursor: pointer;
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;

    &--active {
      background-color: var(--color-main);
      color: white;
    }
  }
}
</style>
