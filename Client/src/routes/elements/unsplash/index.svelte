<script lang="ts">
  import CustomElement from "./../_shared/customElement/customElement.svelte";
  import { translate } from "../../../utilities/translateStore";
  import Loading from "../../../shared/loading.svelte";
  import translations from "./_resources";
  import sharedTranslations from "./../_shared/resources";
  import ObjectTile from "./../_shared/objectTile.svelte";
  import Unsplash from "unsplash-js";
  import moment from "moment";
  import type { IPhoto } from "./_unsplash";
  import debounce from "lodash/debounce";
  import { fade, fly } from "svelte/transition";
  import Invalid from "../_shared/customElement/invalid.svelte";

  interface IUnsplashConfig {
    accessKey: string;
  }

  interface IUnsplashValue {
    assets: IPhoto[];
  }

  let value: IUnsplashValue = { assets: [] };
  let config: IUnsplashConfig;
  let disabled: boolean;

  $: unsplash = config && new Unsplash({ accessKey: config.accessKey });

  let listOpen: boolean = false;
  let filter: string;
  let rawFilter: string = "";
  const debounceFilter = debounce((rawFilter) => (filter = rawFilter), 1000);

  $: rawFilter !== "" && debounceFilter(rawFilter);

  let page: number = 1;

  $: data =
    filter &&
    unsplash.search
      .photos(filter, page, 9)
      .then((result) => result.json() as Promise<{ results: IPhoto[] }>);

  const closeList = () => {
    listOpen = false;
    filter = undefined;
    rawFilter = "";
  };

  const removeAsset = (asset: IPhoto) => {
    value.assets = value.assets.filter((oldAsset) => oldAsset.id !== asset.id);
  };

  const t = translate(translations, [sharedTranslations]);
</script>

<CustomElement bind:value bind:config bind:disabled>
  <div transition:fade>
    {#if !disabled}
      <div class="group">
        {#if !listOpen}
          <button class="button" on:click={() => (listOpen = true)}>
            {$t('open')}
          </button>
        {:else}
          <button class="button" on:click={closeList}> {$t('close')} </button>
        {/if}
      </div>
    {/if}
    <div class="group column">
      {#if listOpen}
        <div class="group" transition:fly={{ y: 80, duration: 400 }}>
          <label class="group column filter"><div class="label">
              {$t('search')}
            </div>
            <input
              class="input"
              type="text"
              placeholder={$t('placeholder')}
              bind:value={rawFilter} />
          </label>
        </div>
      {/if}
      {#if data && listOpen}
        {#await data}
          <Loading />
        {:then result}
          <div class="group wrap" transition:fly={{ y: 80, duration: 400 }}>
            {#each result.results as asset, index (asset.id)}
              <ObjectTile
                name={asset.description}
                selected={value.assets.some((valueAsset) => valueAsset.id === asset.id)}
                detail={moment(asset.updated_at).format('LLL')}
                imageUrl={asset.links.download}
                thumbnailUrl={asset.urls.thumb}
                onClick={() => {
                  if (value.assets.some((valueAsset) => valueAsset.id === asset.id)) {
                    removeAsset(asset);
                  } else {
                    value.assets = [...value.assets, asset];
                  }
                }} />
            {/each}
          </div>
          <div class="group">
            {#if page > 1}
              <button class="button" on:click={() => page--}>
                {$t('previous')}
              </button>
            {/if}
            <button class="button" on:click={() => page++}>
              {$t('next')}
            </button>
          </div>
        {/await}
      {/if}
    </div>
    {#if value.assets}
      <div class="group wrap">
        {#each value.assets as asset (asset.id)}
          <ObjectTile
            showActions={!disabled}
            name={asset.description}
            detail={moment(asset.updated_at).format('LLL')}
            imageUrl={asset.links.download}
            thumbnailUrl={asset.urls.thumb}
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
  .filter {
    flex: 1;
  }
</style>
