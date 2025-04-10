<input class="input" { ...data } />

<script lang="ts">
  let data: Record<string, any> = $props();
</script>

<style lang="scss">
  .input {
    font-size: 11px;
    width: 100%;
    background: #FFF;
    color: #000;
    border: 1px solid var(--color-border);
    padding: 5px 5px 6px;
    margin: 0px;
    box-sizing: border-box;
  }
</style>
