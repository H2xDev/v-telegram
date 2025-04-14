<svelte:element 
  this={tag}
  class="button"
  class:button--flat={flat}
  class:button--inline={inline}
  class:button--big={big}
  style:justify-content={align}
  onclick={ handleClick }
  { href }
>
  <slot />
</svelte:element>

<script lang="ts">
  interface Props {
    tag: string;
    flat?: boolean;
    inline?: boolean;
    big?: boolean;
    href?: string;
    onClickAsync?: (event: MouseEvent) => Promise<any>;
    onClick?: (event: MouseEvent) => any;
  }

  let { 
    flat = false, 
    inline = false,
    big = false,
    align = 'center',
    onClickAsync,
    onClick,
    href,
  }: Props = $props();

  let isLoading = $state(false);
  const tag = $derived(href ? 'a' : 'button');

  const handleClick = (event: MouseEvent) => {
    if (onClickAsync) {
      isLoading = true;
      onClickAsync(event)
        .catch((error) => {
          console.error('Error in async click handler:', error);
        })
        .finally(() => {
          isLoading = false;
        });
    }

    onClick?.(event);
  };
</script>

<style lang="scss">
.button {
  color: #fff;
  border: 0;
  height: 27px;
  width: 100%;
  display: inline-flex;
  font: inherit;
  cursor: pointer;
  border-radius: var(--corners);
  padding: 5px 10px;
  border-bottom: 1px solid var(--color-main);
  background: var(--color-main);
  font: inherit;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  font-weight: normal;

  &:hover {
    text-decoration: none;
  }

  &--flat {
    background: transparent;
    color: var(--color-main);
    border: 1px solid transparent;

    &:hover {
      background: var(--color-bg);
    }
  }

  &--inline {
    width: auto;
  }

  &--big {
    font-size: 12px;
  }
}
</style>
