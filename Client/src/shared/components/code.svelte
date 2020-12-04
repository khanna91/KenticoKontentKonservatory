<script lang="ts">
  export let code: string;
</script>

<code>{code}</code>

<style>
  code {
    font-family: menlo, inconsolata, monospace;
    font-size: calc(1em - 2px);
    color: #555;
    background-color: #f0f0f0;
    padding: 0.2em 0.4em;
    border-radius: 2px;
    display: block;
    white-space: pre-wrap;
    max-height: 20em;
    overflow-y: auto;
    word-break: break-all;
  }
</style>
