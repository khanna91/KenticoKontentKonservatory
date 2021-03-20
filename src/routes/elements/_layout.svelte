<div>
  <slot />
</div>

<style>
  div :global(.group) {
    display: flex;
    margin-bottom: 0.5em;
  }

  div :global(.wrap) {
    flex-wrap: wrap;
  }

  div :global(.column) {
    flex-direction: column;
  }

  div :global(.item) {
    flex: 1;
  }

  div :global(.label) {
    font-size: 0.8em;
    font-weight: 600;
    color: #919194;
    margin-bottom: 0.5em;
  }

  div :global(.input) {
    border: none;
    outline: none;
    font-size: 1em;
    font-family: Source Sans Pro, sans-serif;
    width: 100%;
  }

  div :global(.input:focus) {
    border-color: #0a68f5 !important;
    outline: none;
  }

  div :global(.select) {
    border: none;
    font-family: inherit;
    font-size: inherit;
    line-height: inherit;
    margin: 0.4em 0em;
  }

  div :global(.select:focus) {
    outline: none;
  }

  div :global(.button) {
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

  div :global(.button.destructive:focus, .button.destructive:hover) {
    color: #fff !important;
    background-color: #f02222 !important;
    border-color: transparent !important;
  }

  div :global(.button:focus, .button:hover) {
    color: #4c4d52 !important;
    background-color: rgba(76, 77, 82, 0.1) !important;
    border-color: #919194 !important;
  }

  @media (max-width: 800px) {
    div :global(.group) {
      flex-direction: column;
    }
  }
</style>
