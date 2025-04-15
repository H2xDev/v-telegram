<p class="error" align="center">
  { page.error.message }

  <VkButton href="/channels" inline>
    To the channel list
  </VkButton>
</p>

<script lang="ts">
  import { page } from "$app/state";
  import VkButton from "$components/VkButton.svelte";
</script>

<style lang="scss">
  .error {
    padding: var(--gap);
    color: var(--color-gray);
    font-weight: bold;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--gap);
  }
</style>
