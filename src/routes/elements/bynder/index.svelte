<script context="module" lang="ts">
  declare const BynderCompactView: BynderCompactViewType;
</script>

<script lang="ts">
  import CustomElement from "./../_shared/customElement/customElement.svelte";
  import { translate } from "../../../utilities/translateStore";
  import Loading from "../../../shared/loading.svelte";
  import translations from "./_resources";
  import sharedTranslations from "./../_shared/resources";
  import ObjectTile from "./../_shared/objectTile.svelte";
  import type {
    AdditionalInfo,
    IAsset,
    IBynderOptions,
    BynderCompactView as BynderCompactViewType,
  } from "./_bynder";
  import moment from "moment";
  import { fade } from "svelte/transition";
  import Invalid from "../_shared/customElement/invalid.svelte";

  interface IBynderConfig {
    bynderOptions: Partial<IBynderOptions>;
  }

  interface IBynderValue {
    assets: IAsset[];
  }

  let value: IBynderValue = { assets: [] };
  let config: IBynderConfig;
  let disabled: boolean;

  let listOpen: boolean = false;
  let container: HTMLDivElement;

  const onSuccess = (assets: IAsset[], additionalInfo?: AdditionalInfo) => {
    value.assets = assets;
    listOpen = false;
    container.textContent = "";
  };

  $: if (config && container) {
    config.bynderOptions.onSuccess = onSuccess;
    config.bynderOptions.container = container;
  }

  $: if (config) {
    config.bynderOptions.selectedAssets = value.assets.map(
      (asset) => asset.databaseId
    );
  }

  const click = () => {
    BynderCompactView.open(config.bynderOptions);
    listOpen = true;
  };

  const removeAsset = (asset: IAsset) => {
    value.assets = value.assets.filter((oldAsset) => oldAsset.id !== asset.id);
  };

  const t = translate(translations, [sharedTranslations]);
</script>

<svelte:head>
  <script
    src="https://d8ejoa1fys2rk.cloudfront.net/5.0.5/modules/compactview/bynder-compactview-2-latest.js">
  </script>
</svelte:head>

<CustomElement bind:value bind:config bind:disabled>
  <div transition:fade>
    {#if !disabled}
      <div class="group">
        <button class="button" on:click={click}> {$t('open')} </button>
        {#if listOpen}
          <button class="button" on:click={() => onSuccess(value.assets)}>
            {$t('close')}
          </button>
        {/if}
      </div>
      <div class:listOpen bind:this={container} />
    {/if}
    {#if value.assets}
      <div class="group wrap">
        {#each value.assets as asset (asset.id)}
          <ObjectTile
            showActions={!disabled}
            imageUrl={asset.derivatives.webImage}
            name={asset.name}
            thumbnailUrl={asset.derivatives.thumbnail}
            detail={moment(asset.updatedAt).format('LLL')}
            onRemove={() => removeAsset(asset)} />
        {/each}
      </div>
    {/if}
  </div>
  <div slot="loading">
    <Loading />
  </div>
  <div slot="invalid">
    <Invalid />
  </div>
</CustomElement>

<style>
  .listOpen {
    height: 40em;
  }
</style>
