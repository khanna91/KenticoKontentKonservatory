<script context="module" lang="ts">
  import type { Resource, TFunction } from "i18next";
  import i18next from "i18next";
  import { readable } from "svelte/store";

  declare const CustomElement: ICustomElement;

  export const translate = (
    translations: Resource,
    moreTranslations: Resource[] = [],
    locale = "en_us"
  ) =>
    readable<TFunction>(
      () => {},
      (set) => {
        i18next
          .init({
            lng: locale,
            resources: translations,
          })
          .then((t) => {
            for (const translation of moreTranslations) {
              for (const languageName in translation) {
                const language = translation[languageName];

                for (const namespaceName in language) {
                  const resouceBundle = language[namespaceName];

                  i18next.addResourceBundle(
                    languageName,
                    namespaceName,
                    resouceBundle,
                    true
                  );
                }
              }
            }

            set(t);
          });
      }
    );
</script>

<script lang="ts">
  import { afterUpdate, createEventDispatcher, onMount } from "svelte";
  import type { IContext, ICustomElement } from "./customElement";

  export let value: any;
  export let config: {};
  export let context: IContext;
  export let height: number;
  export let disabled: boolean;

  let root: HTMLDivElement;
  let invalid: boolean;
  let customElement: ICustomElement;

  const dispatch = createEventDispatcher();

  onMount(() => {
    invalid = window.self === window.top;

    if (invalid) {
      return;
    }

    customElement = CustomElement;

    customElement.init((element, elementContext) => {
      element.value && (value = JSON.parse(element.value));
      config = element.config;
      context = elementContext;
      disabled = element.disabled;

      dispatch("ready");
    });

    customElement.onDisabledChanged(
      (elementDisabled) => (disabled = elementDisabled)
    );
  });

  $: {
    value && customElement?.setValue(JSON.stringify(value));
  }

  $: {
    height !== undefined && customElement?.setHeight(height);
  }

  afterUpdate(
    () => height === undefined && customElement?.setHeight(root.scrollHeight)
  );
</script>

<svelte:head>
  <script src="https://app.kontent.ai/js-api/custom-element.js">
  </script>
</svelte:head>

<div bind:this={root}>
  {#if !invalid}
    {#if value && config}
      <slot />
    {:else}
      <slot name="loading" />
    {/if}
  {:else}
    <slot name="invalid" />
  {/if}
</div>

<style>
  @import url("https://fonts.googleapis.com/css?family=Source+Sans+Pro:400,700,400italic,700italic");

  :global(body) {
    font-family: Source Sans Pro, sans-serif;
    overflow: hidden;
  }
</style>
