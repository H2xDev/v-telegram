<div class="dialogs">
  <div class="tabs">
    <button
      class="clear tabs__tab-button"
      class:tabs__tab-button--active={currentTab === 0}
      onclick={() => currentTab = 0}
    >
      Messages
    </button>

    <button
      class="clear tabs__tab-button"
      class:tabs__tab-button--active={currentTab === 1}

      onclick={() => currentTab = 1}
    >
      Chats
    </button>
    <button
      class="clear tabs__tab-button"
      class:tabs__tab-button--active={currentTab === 2}

      onclick={() => currentTab = 2}
    >
      Bots
    </button>
  </div>
  <div class="dialogs__status">
    <b>{currentDialogList.length} dialogs</b>
  </div>
  <div class="divider"></div>
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

  const messengerService = new MessengerService();

  let currentTab = $state(0);
  let chats = $state(messengerService.chats);
  let contacts = $state(messengerService.contacts);
  let bots = $state(messengerService.bots);

  const currentDialogList = $derived([contacts, chats, bots][currentTab]);

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
