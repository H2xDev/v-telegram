<svelte:element 
  this={tag}
  class="button { clazz }"
  class:button--flat={flat}
  class:button--inline={inline}
  class:button--big={big}
  style:justify-content={align}
  onclick={ handleClick }
  { href }
>
  <slot />
  { label }
</svelte:element>

<script lang="ts">
  interface Props {
    tag: string;
    flat?: boolean;
    inline?: boolean;
    align?: 'flex-start' | 'center' | 'flex-end';
    big?: boolean;
    href?: string;
    class?: string;
    label?: string;
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
    class: clazz = '',
    label = '',
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
  min-width: 64px;
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

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
