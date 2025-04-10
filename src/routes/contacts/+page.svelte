<main class="friends">
  <VkDivider>
    You have { contacts.length } contacts
  </VkDivider>

  {#each contacts as dialog}
    <ContactPanel { dialog } />
  {/each}
</main>

<script lang="ts">
  import { MessengerService } from "$lib/messenger.service";
  import type { DialogModel } from "$models/dialog.model";
  import ContactPanel from "$components/ContactPanel.svelte";
  import VkDivider from "$components/VkDivider.svelte";
  
  const messengerService = new MessengerService;
  let contacts: DialogModel[] = $state(messengerService.contacts);

  messengerService.loadDialogs()
    .then(() => {
      contacts = messengerService.contacts;
    });
</script>

<style lang="scss">
  .friends {
    display: flex;
    flex-direction: column;
    gap: var(--gap);
    padding: var(--gap);
  }
</style>
