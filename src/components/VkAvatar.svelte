{#key id}
{#if url}
    <img class="user-avatar {clazz}" src="{url}" alt="" style:--size={size}>
{:else}
    <div 
      class="user-avatar {clazz}"
      style:--size={size}
    >
      <VkSpinner />
    </div>
{/if}
{/key}

<script lang="ts">
  import { UserService } from "$lib/user.service";
  import { onMount } from "svelte";
  import VkSpinner from "./VkSpinner.svelte";

  const service = new UserService();

  interface Props {
    id: string | number;
    size?: number;
    spinner?: boolean;
    class?: string;
  }

  let { id, size = 50, spinner, class: clazz }: Props = $props();
  let url: string | null = $state(null);

  onMount(async () => {
    if (!id) return;
    url = await service.getUserPhoto(id);
  });
</script>

<style lang="scss">
  .user-avatar {
    position: relative;
    border-radius: var(--corners);
    aspect-ratio: 1 / 1;
    object-fit: cover;

    &::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: var(--color-bg);
      border-radius: 4px;
    }
  }
</style>
