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

  type SearchPhotosResponse = Response & {
    json(): Promise<{ results: IPhoto[] }>;
  };

  interface IUnsplashConfig {
    accessKey: string;
  }

  interface IUnsplashValue {
    assets: IPhoto[];
  }

  let value: IUnsplashValue = { assets: [] };
  let config: IUnsplashConfig;
  let disabled: boolean;

  let listOpen: boolean = false;

  $: unsplash = config && new Unsplash({ accessKey: config.accessKey });

  let rawFilter: string = "";

  $: if (rawFilter !== "") {
    searchPhotosResults = undefined;
    debounceFilter(rawFilter);
  }

  const debounceFilter = debounce((rawFilter) => (filter = rawFilter), 1000);

  let filter: string;
  let page: number = 1;
  let searchPhotosResults: IPhoto[];

  $: filter && page !== undefined && search();

  const search = async () => {
    const response = await (unsplash.search.photos(filter, page, 9) as Promise<
      SearchPhotosResponse
    >);

    if (!response.ok) {
      console.log(await response.text());
      return;
    }

    searchPhotosResults = (await response.json()).results;
  };

  const removeAsset = (asset: any) => {
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
          <button
            class="button"
            on:click={() => {
              listOpen = false;
              rawFilter = '';
            }}>
            {$t('close')}
          </button>
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
        {#if rawFilter !== '' && !searchPhotosResults}
          <Loading />
        {/if}
        {#if searchPhotosResults}
          <div class="group wrap" transition:fly={{ y: 80, duration: 400 }}>
            {#each searchPhotosResults as asset, index (asset.id)}
              <ObjectTile
                name={asset.description}
                selected={value.assets.some((valueAsset) => valueAsset.id === asset.id)}
                detail={moment(asset.updated_at).format('LLL')}
                imageUrl={asset.links.download}
                thumbnailUrl={asset.urls.thumb}
                delay={index * 50}
                onClick={() => {
                  if (value.assets.some((valueAsset) => valueAsset.id === asset.id)) {
                    value.assets = value.assets.filter((valueAsset) => valueAsset.id !== asset.id);
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
        {/if}
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
