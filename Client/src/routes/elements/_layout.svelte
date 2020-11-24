<slot />

<style>
  :global(.group) {
    display: flex;
    margin-bottom: 0.5em;
  }

  :global(.wrap) {
    flex-wrap: wrap;
  }

  :global(.column) {
    flex-direction: column;
  }

  :global(.label) {
    font-size: 0.8em;
    font-weight: 600;
    color: #919194;
    margin-bottom: 0.5em;
  }

  :global(.input) {
    border: none;
    outline: none;
    font-size: 1em;
    font-family: Source Sans Pro, sans-serif;
    width: 100%;
  }

  :global(.input:focus) {
    border-color: #0a68f5 !important;
    outline: none;
  }

  :global(.select) {
    border: none;
    font-family: inherit;
    font-size: inherit;
    line-height: inherit;
    margin: 0.4em 0em;
  }

  :global(.select:focus) {
    outline: none;
  }

  :global(.button) {
    font: inherit;
    display: inline-block;
    cursor: pointer;
    border-style: solid;
    transition: all 0.25s cubic-bezier(0.23, 1, 0.32, 1) 50ms, border-width 0ms,
      padding 0ms;
    color: #4c4d52;
    background-color: initial;
    border-color: #919194;
    padding: 0.25em 0.3em;
    min-width: 48px;
    margin: 0.6em 0.6em 0.4em;
    font-size: 0.85em;
    border-width: 0.1em;
    border-radius: 0.25em;
  }

  :global(.button.destructive:focus, .button.destructive:hover) {
    color: #fff;
    background-color: #f02222;
    border-color: transparent;
  }

  :global(.button:focus, .button:hover) {
    color: #4c4d52;
    background-color: rgba(76, 77, 82, 0.1);
    border-color: #919194;
  }
</style>
