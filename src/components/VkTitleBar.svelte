<div 
  class="title-bar"
  class:title-bar--secondary={secondary}
  class:title-bar--tiny={tiny}
>
  <slot />
</div>

<script lang="ts">
  let { secondary = false, tiny = false } = $props();
</script>

<style lang="scss">
  .title-bar {
    font-weight: 700;
    font-size: 11px;
    padding: 7px 10px;
    line-height: 140%;
    background: var(--color-bg);
    color: var(--color-main);
    border-right: 1px solid #D9E0E7;
    min-height: 25px;
    display: flex;
    align-items: center;
    box-sizing: border-box;
    line-height: 1;
    width: 100%;

    &--secondary {
      background: var(--color-bg-alt);
      color: var(--color-gray);
      font-weight: 400;
      min-height: 20px;
      padding: 10px;
      border-right: 0;
    }

    &--tiny {
      padding: 4px 10px;
    }
  }
</style>
