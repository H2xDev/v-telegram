<main class="user">
	<p class="user__title title-bar">
		{#if !user}
			<Spinner />
		{:else}
			@{ user.username }
		{/if}
	</p>

	<div class="user__layout">
		<div class="user__sidebar">
			<Avatar class="user__avatar" spinner={!user} id={page.data.id} />

			{#if !user?.isSelf}
				<div class="title-bar title-bar--secondary">
					<a class="button" href="/messages/{page.data.id}">Send message</a>
				</div>
			{/if}

			<div>
				<p class="title-bar">
					Followers
				</p>

				<p class="title-bar title-bar--secondary title-bar--tiny">
					{ user?.personalChannel?.subscribersCount || 0 } followers
				</p>
			</div>
		</div>

		<div class="user__body">
			<h1 class="page-headline">
				{ user?.fullName }
			</h1>

      {#if user?.about}
        <section class="user__bio-section">
			    <h2 class="divider">
            About
          </h2>
          <p>
            { user.about }
          </p>
        </section>
      {/if}

      <section class="user__bio-section">
			  <h2 class="divider">
			  	Personal information
			  </h2>

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
				<p class="title-bar">
					Posts
				</p>
				<p class="small-text" align="center">
					This user has no personal channel
				</p>
			{/if}
		</div>
	</div>
</main>

<script lang="ts">
  import { page } from '$app/state';
  import { UserService } from '$lib/user.service';
  import type { UserModel } from '$models/user.model';
  
  import Spinner from '$components/Spinner.svelte';
  import Avatar from '$components/Avatar.svelte';
  import ChannelPosts from '$components/ChannelPosts.svelte';
  
  let user: UserModel | null = $state(null);
  const age = $derived(new Date().getFullYear() - (user?.birthday ? new Date(user?.birthday).getFullYear() : 0));
  
  const service = new UserService();
  service.getFullUser(page.data.id).then((data) => { user = data; });
  
  $effect(() => {
    service.getFullUser(page.data.id).then((data) => { user = data });
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
			top: calc(var(--gap) + 43px);

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
		}

		&__body {
			display: flex;
			flex-direction: column;
			max-width: 410px;
			width: 100%;
			gap: var(--gap);
		}

		&__content-headline {
			display: flex;
			flex-direction: column;
			gap: var(--gap-small);
		}

    &__bio-section {
      display: flex;
      flex-direction: column;
      gap: var(--gap-small);
    }
	}
</style>
