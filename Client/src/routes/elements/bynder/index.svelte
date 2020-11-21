<script context="module" lang="ts">
  declare const BynderCompactView: BynderCompactViewType;
</script>

<script lang="ts">
  import CustomElement, {
    translate,
  } from "./../_shared/customElement/customElement.svelte";
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

  interface IBynderConfig {
    bynderOptions: Partial<IBynderOptions>;
  }

  interface IBynderValue {
    assets: IAsset[];
  }

  let value: IBynderValue = { assets: [] };
  let config: IBynderConfig;
  let disabled: boolean;

  let loading: boolean = false;

  const onSuccess = (assets: IAsset[], additionalInfo?: AdditionalInfo) => {
    value.assets = assets;
    loading = false;
  };

  $: {
    config && (config.bynderOptions.onSuccess = onSuccess);
  }

  const click = () => {
    BynderCompactView.open(config.bynderOptions);
    loading = true;
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
  <div class:loading transition:fade>
    {#if !disabled}
      <div class="group">
        <button class="button" on:click={click}> {$t('open')} </button>
      </div>
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
    <a href={$t('documentationUrl')} target="_blank">{$t('whatToDo')}</a>.
  </div>
</CustomElement>

<style>
  .loading {
    height: 500px;
  }
</style>
