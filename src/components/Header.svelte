<header class="block-blue header">
	<img class="header__logo" src="https://vtelege-530a8.web.app/logo.png" alt="Logo">

	<nav class="header__navigation">
		<a href="/channels">Channels</a>

    <div class="header__music-player">
      <a href="/music">
        Music
      </a>
      <MiniMusicPlayer />
    </div>

		<a href="/logout">Logout</a>
	</nav>
</header>

<script lang="ts">
  import MiniMusicPlayer from "./MiniMusicPlayer.svelte";
</script>

<style lang="scss">
.header {
	height: var(--header-height);
	padding: var(--gap);
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
	box-sizing: border-box;
	display: flex;
	align-items: center;
	justify-content: space-between;
	position: sticky;
	top: 0;
	z-index: 100;
		
	&__logo {
		margin: -1.5px 0;
	}

	&__navigation {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--gap-large);
	}

  &__music-player {
    display: flex;
    align-items: center;
    gap: var(--gap);
  }

  a {
    color: white;
    font-weight: 700;
  }
}
</style>
