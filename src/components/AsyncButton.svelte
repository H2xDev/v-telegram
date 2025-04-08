<button
  class="button"
  onclick={ handleClick }
>
  {#if isLoading}
    <Spinner />
  {:else}
    <slot />
  {/if}
</button>

<script lang="ts">
  import Spinner from "./Spinner.svelte";

  interface Props {
    onclick: () => Promise<any>;
  }

  let { onclick }: Props = $props();
  let isLoading = $state(false);

  const handleClick = async () => {
    try {
      isLoading = true;
      await onclick();
    } finally {
      isLoading = false;
    }
  };
</script>
