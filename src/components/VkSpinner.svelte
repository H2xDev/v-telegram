<div class="spinner" class:spinner--dark={dark}>
  <div></div>
  <div></div>
  <div></div>
</div>

<script lang="ts">
  interface Props {
    dark?: boolean;
  }

  let { dark }: Props = $props();
</script>

<style lang="scss">
  .spinner {
    --first-color: #C1CDD9;
    --second-color: #45688E;

    --dash-width: 8px;
    --dash-height: 4px;

    display: flex;
    align-items: center;
    justify-content: center;
    gap: 2px;
    padding: 2px;

    & > div {
      width: var(--dash-width);
      height: var(--dash-height);
      background-color: var(--first-color);

      animation: blink 1s steps(2) infinite;

      @for $i from 1 through 3 {
        &:nth-child(#{$i}) {
          animation-delay: $i * 0.1s;
        }
      }
    }

    &--dark {
      --first-color: var(--color-main);
      --second-color: var(--color-bg);
    }
  }

  @keyframes blink {
    from {
      background-color: var(--second-color);
    }

    30% {
      background-color: var(--first-color);
    }
  }
</style>
