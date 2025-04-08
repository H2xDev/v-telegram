<div 
  class="track-control {clazz}" 
  onmousedown={handleTrack} 
  role="button" 
  tabindex="0"

  style:--track-percent={value}
  style:--track-nail-width={nailWidth + 'px'}
>
  {#if counter}
    <div class="track-control__counter">
      {counter}
    </div>
  {/if}
</div>

<script lang="ts">
  interface Props {
    onTrackState: (state: boolean) => void;
    onTrackChange: (value: number) => void;
    value: number;
    counter: string;
    nailWidth: number;
    class: string;
  }

  let { onTrackState, onTrackChange, value = $bindable(0), counter = '', nailWidth = 15, class: clazz = '' }: Props = $props();

  const handleTrack = (e: MouseEvent) => {
    e.preventDefault();
    const el = e.target as HTMLElement;
    onTrackState?.(true);

    const mouseMove = (m: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = m.clientX - rect.left;
      value = Math.max(0, Math.min(1, x / rect.width));
      onTrackChange?.(value);
    }

    mouseMove(e);

    window.addEventListener('mousemove', mouseMove);
    window.addEventListener('mouseup', () => {
      window.removeEventListener('mousemove', mouseMove);
      onTrackState?.(false);
    }, { once: true });
  }
</script>

<style lang="scss">
.track-control {
  --track-percent: 0;
  --track-nail-width: 15px;
  --track-bg-color: rgba(255 255 255 / 0.5);
  --track-fg-color: white;

  position: relative;
  height: 5px;
  width: 100%;
  margin-top: 5px;
  image-rendering: pixelated;

  &::before {
    content: '';
    display: block;
    height: 1px;
    background: 
      linear-gradient(
        to right,
        var(--track-bg-color) 0%,
        var(--track-bg-color) 50%,
        var(--track-fg-color) 50%,
        var(--track-fg-color) 100%
      );
    background-size: 200% 100%;
    background-position: calc(var(--track-percent) * -100%) 0;
    width: 100%;
  }

  &::after {
    content: '';
    height: 5px;
    width: var(--track-nail-width);
    display: block;
    background-color: white;
    margin-top: -1px;
    left: calc(100% * var(--track-percent));
    margin-left: calc(-1 * var(--track-nail-width) * var(--track-percent));
    position: relative;
  }

  &__counter {
    position: absolute;
    right: 0;
    bottom: 100%;
    font-size: 11px;
    font-weight: bold;
    color: white;
    padding-bottom: 2px;
  }
}
</style>
