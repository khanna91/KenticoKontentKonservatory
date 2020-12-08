<script lang="ts">
  import CustomElement from "../_shared/customElement/customElement.svelte";
  import { translate } from "../../../utilities/translateStore";
  import Loading from "../../../shared/loading.svelte";
  import translations from "./_resources";
  import sharedTranslations from "../_shared/resources";
  import ObjectTile from "../_shared/objectTile.svelte";
  import moment from "moment";
  import debounce from "lodash/debounce";
  import { fade, fly } from "svelte/transition";
  import Invalid from "../_shared/customElement/invalid.svelte";
  import { onMount } from "svelte";
  import type {
    gapi,
    IYouTubeSearchListResponse,
    IYouTubeSearchResultSnippet,
  } from "./_gapi";

  interface IYouTubeVideoConfig {
    apiKey: string;
  }

  interface IYouTubeValue {
    video?: IYouTubeSearchResultSnippet & { videoId: string };
  }

  let value: IYouTubeValue = {};
  let config: IYouTubeVideoConfig;
  let disabled: boolean;

  onMount(() => {
    gapi.load("client", () => {
      gapi.client.setApiKey(config.apiKey);
      gapi.client.load(
        "https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest"
      );
    });
  });

  let listOpen: boolean = false;
  let filter: string;
  let rawFilter: string = "";
  const debounceFilter = debounce((rawFilter) => (filter = rawFilter), 1000);

  $: rawFilter !== "" && debounceFilter(rawFilter);

  let pageToken: string;
  let nextPageToken: string;
  let prevPageToken: string;

  $: filter &&
    gapi.client.youtube.search
      .list({
        part: ["snippet"],
        maxResults: 9,
        type: "video",
        pageToken,
        q: filter,
      })
      .then((result) => {
        dataResult = result.result;
        nextPageToken = result.result.nextPageToken;
        prevPageToken = result.result.prevPageToken;
      });

  let dataResult: IYouTubeSearchListResponse;

  const closeList = () => {
    listOpen = false;
    filter = undefined;
    rawFilter = "";
    pageToken = undefined;
    dataResult = undefined;
  };

  const t = translate(translations, [sharedTranslations]);
</script>

<svelte:head>
  <script src="https://apis.google.com/js/api.js">
  </script>
</svelte:head>

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
        {#if value.video}
          <button
            class="button destructive"
            in:fade|local
            on:click={() => (value.video = undefined)}>
            {$t('clear')}
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
      {/if}
      {#if !dataResult && filter !== undefined}
        <Loading />
      {:else if dataResult}
        <div class="group wrap" transition:fly={{ y: 80, duration: 400 }}>
          {#each dataResult.items as video, index (video.id)}
            <ObjectTile
              name={video.snippet.title}
              detail={moment(video.snippet.publishedAt).format('LLL')}
              thumbnailUrl={video.snippet.thumbnails.medium.url}
              onClick={() => {
                value.video = { ...video.snippet, videoId: video.id.videoId };
                closeList();
              }} />
          {/each}
        </div>
        <div class="group">
          {#if prevPageToken}
            <button class="button" on:click={() => (pageToken = prevPageToken)}>
              {$t('previous')}
            </button>
          {/if}
          <button class="button" on:click={() => (pageToken = nextPageToken)}>
            {$t('next')}
          </button>
        </div>
      {/if}
    </div>
    {#if value.video}
      <div class="group wrap">
        <iframe
          class="video"
          title={value.video.title}
          src={`https://www.youtube.com/embed/${value.video.videoId}?controls=0`}
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen />
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

  .video {
    margin: 0 auto;
    width: 32em;
    height: 18em;
  }
</style>
