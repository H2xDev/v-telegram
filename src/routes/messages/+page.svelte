<div class="dialogs">
  <VkTabs {tabs} {currentTab} {onChangeTab} />

  <div class="dialogs__status">
    <b>{currentDialogList.length} dialogs</b>
  </div>

  <VkDivider></VkDivider>
  <div class="dialogs__list">
    {#each currentDialogList as dialog}
      {#key dialog.id}
        <DialogPanel { dialog } />
      {/key}
    {/each}
  </div>
</div>

<script lang="ts">
  import { onMount } from "svelte";
  import { MessengerService } from "$lib/messenger.service";
  import DialogPanel from "$components/DialogPanel.svelte";
  import VkTabs from "$components/VkTabs.svelte";
  import VkDivider from "$components/VkDivider.svelte";

  const messengerService = new MessengerService();

  let currentTab = $state(0);
  let chats = $state(messengerService.chats || []);
  let contacts = $state(messengerService.contacts || []);
  let bots = $state(messengerService.bots || []);

  const tabs = ['Messages', 'Chats', 'Bots'];
  const currentDialogList = $derived([contacts, chats, bots][currentTab]);

  const onChangeTab = (index: number) => {
    currentTab = index;
  }

  onMount(() => {
    messengerService.loadDialogs()
      .then(() => {
        chats = messengerService.chats;
        contacts = messengerService.contacts;
        bots = messengerService.bots;
      });
  })

</script>

<style lang="scss">
  .dialogs {
    border-right: 1px solid var(--color-light);;
    padding-right: var(--gap);

    &__list {
      width: 100%;
    }

    &__status {
      padding: var(--gap);
      padding-top: 20px;
      padding-bottom: var(--gap-small);
      border-bottom: 1px solid var(--color-light);
      color: var(--color-main);
    }
  }
</style>
