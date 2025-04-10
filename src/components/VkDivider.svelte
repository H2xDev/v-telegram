<svelte:element this={tag} class="divider">
  <slot />
</svelte:element>

<script lang="ts">
  interface Props {
    tag: string;
  }

  let { tag = 'div' }: Props = $props();
</script>

<style lang="scss">
.divider {
  display: flex;
  align-items: center;
  gap: var(--gap);
  white-space: nowrap;
  color: var(--color-main);
  font-weight: 700;
  font-size: 11px;
  margin: 0;

  &::after {
    content: '';
    display: block;
    height: 1px;
    background: var(--color-border);
    width: 100%;
  }
}
</style>
