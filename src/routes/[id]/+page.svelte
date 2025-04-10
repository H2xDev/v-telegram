<svelte:head>
  <title>{ user?.fullName || 'Loading...' } | Profile</title>
</svelte:head>

<main class="user">
	<VkTitleBar class="user__title">
		{#if !user}
			<VkSpinner />
		{:else}
			@{ user.username }
		{/if}
	</VkTitleBar>

	<div class="user__layout">
		<div class="user__sidebar">
			<VkAvatar class="user__avatar" spinner={!user} id={page.params.id} />

			{#if !user?.isSelf}
				<VkTitleBar secondary>
					<VkButton href="/messages/{page.params.id}">Send message</VkButton>
				</VkTitleBar>
			{/if}

			<div>
				<VkTitleBar tag="p" class="title-bar">
					Followers
				</VkTitleBar>

				<VkTitleBar secondary tiny>
					{ user?.personalChannel?.subscribersCount || 0 } followers
				</VkTitleBar>
			</div>
		</div>

		<div class="user__body">
			<h1 class="page-headline">
				{ user?.fullName }
			</h1>

      {#if user?.about}
        <section class="user__bio-section">
			    <VkDivider tag="h2" class="divider">
            About
          </VkDivider>
          <p>
            { user.about }
          </p>
        </section>
      {/if}

      <section class="user__bio-section">
			  <VkDivider tag="h2">
			  	Personal information
			  </VkDivider>

			  <table width="100%" cellspacing="0">
			  	<tbody class="small-text">
			  		<tr>
			  			<td class="small-text-hint" width="120">
			  				Birthday:
			  			</td>

			  			<td>
			  				{#if user?.birthday}
			  					{ new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric', day: '2-digit' }).format(user.birthday) } ({ age } years old)
			  				{:else}
			  					Not specified
			  				{/if}
			  			</td>
			  		</tr>
			  		<tr>
			  			<td class="small-text-hint">
			  				Mobile number:
			  			</td>

			  			<td>
			  				{#if user?.phone}
			  					+{ user.phone }
			  				{:else}
			  					Not specified
			  				{/if}
			  			</td>
			  		</tr>
			  	</tbody>
			  </table>
      </section>

			{#if user && user?.personalChannel}
				<ChannelPosts channel={user.personalChannel.id} title="Posts" />
			{:else}
        <VkTitleBar tag="p"> Posts </VkTitleBar>
				<p class="small-text" align="center">
					This user has no personal channel
				</p>
			{/if}
		</div>
	</div>
</main>

<script lang="ts">
  import { onMount } from 'svelte';
  import type { UserModel } from '$models/user.model';
  import { page } from '$app/state';
  
  import VkSpinner from '$components/VkSpinner.svelte';
  import VkAvatar from '$components/VkAvatar.svelte';
  import VkTitleBar from '$components/VkTitleBar.svelte';
  import VkDivider from '$components/VkDivider.svelte';
  import VkButton from '$components/VkButton.svelte';

  import ChannelPosts from '$components/ChannelPosts.svelte';
  import { UserService } from '@/lib/user.service';

  let user: UserModel | null = $state(null);
  const age = $derived(new Date().getFullYear() - (user?.birthday ? new Date(user?.birthday).getFullYear() : 0));
  
  onMount(async () => {
    user = await new UserService().getFullUser(page.params.id);
  });
</script>

<style lang="scss">
	.user {
		display: flex;
		flex-direction: column;
		padding-right: 10px;

		:global &__avatar {
			aspect-ratio: 0.5 !important;
		}

		&__sidebar {
			display: flex;
			flex-direction: column;
			gap: var(--gap);
			padding-left: var(--gap);
			width: 210px;
			flex-shrink: 0;
			position: sticky;
      top: calc(var(--gap) + var(--header-height));

			& :global(.user-avatar) {
				width: 100%;
			}
		}

		&__title {
			margin-bottom: var(--gap);
		}

		&__layout {
			display: flex;
			gap: var(--gap);
			width: 100%;
			max-width: 100%;
			align-items: flex-start;
      padding-top: var(--gap);
		}

		&__body {
			display: flex;
			flex-direction: column;
			max-width: 410px;
			width: 100%;
			gap: var(--gap);
		}

    &__bio-section {
      display: flex;
      flex-direction: column;
      gap: var(--gap-small);
    }
	}
</style>
