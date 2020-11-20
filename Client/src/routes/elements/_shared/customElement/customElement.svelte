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
  import { createEventDispatcher, onMount } from "svelte";
  import type { IContext, ICustomElement } from "./customElement";
  import { toRounded } from "../../../../utilities/numbers";

  export let value: any;
  export let config: {};
  export let context: IContext;
  export let height: number;
  export let disabled: boolean;

  let root: HTMLDivElement;
  let resizeObserver: ResizeObserver;
  let invalid: boolean;
  let customElement: ICustomElement;

  const dispatch = createEventDispatcher();

  onMount(() => {
    invalid = window.self === window.top;

    if (invalid) {
      return;
    }

    resizeObserver = new ResizeObserver((entries) => {
      if (height !== undefined) {
        return;
      }

      for (let entry of entries) {
        if (entry.contentBoxSize && entry.contentBoxSize[0]) {
          customElement?.setHeight(
            toRounded(entry.contentBoxSize[0].blockSize)
          );
        } else {
          customElement?.setHeight(toRounded(entry.contentRect.height));
        }
      }
    });

    resizeObserver.observe(root);

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
    height !== undefined && customElement?.setHeight(toRounded(height));
  }
</script>

<svelte:head>
  <script src="https://app.kontent.ai/js-api/custom-element.js">
  </script>
</svelte:head>

<div bind:this={root}>
  {#if !invalid}
    {#if config}
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
