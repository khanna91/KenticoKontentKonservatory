<script lang="ts">
  import CustomElement, {
    translate,
  } from "../_shared/customElement/customElement.svelte";
  import Loading from "../../../shared/loading.svelte";
  import translations from "./_resources";
  import sharedTranslations from "../_shared/resources";
  import { fade } from "svelte/transition";
  import Invalid from "../_shared/customElement/invalid.svelte";
  import wretch from "wretch";
  import type { IContext } from "../_shared/customElement/customElement";
  import moment from "moment";
  import { toRounded } from "../../../utilities/numbers";
  import type { IContentItem } from "../_shared/management";

  interface IDeepCloneResponse {
    totalApiCalls: number;
    totalMilliseconds: number;
    newItems: IContentItem[];
  }

  interface IDeepCloneConfig {
    deepCloneEndpoint: string;
  }

  let value = null;
  let config: IDeepCloneConfig;
  let context: IContext;
  let disabled: boolean;

  let loading: boolean = false;
  let responseError: any;
  let response: IDeepCloneResponse;

  const clone = async () => {
    loading = true;

    const request = wretch(
      `${config.deepCloneEndpoint}/${context.item.codename}/${context.variant.codename}`
    )
      .post()
      .json<IDeepCloneResponse>();

    try {
      responseError = undefined;
      response = await request;
    } catch (error) {
      responseError = error;
    }

    loading = false;
  };

  $: totalTime = response && getTotalTime();

  const getTotalTime = () => {
    const totalTime = moment.duration(response.totalMilliseconds);
    const result = [];

    if (totalTime.hours() > 0) {
      result.push(`${totalTime.hours()} ${$t("hours")}`);
    }

    if (totalTime.minutes() > 0) {
      result.push(`${totalTime.minutes()} ${$t("minutes")}`);
    }

    if (totalTime.seconds() > 0) {
      result.push(
        `${
          totalTime.seconds() + toRounded(totalTime.milliseconds() / 1000, 3)
        } ${$t("seconds")}`
      );
    }

    return result.join(", ");
  };

  const t = translate(translations, [sharedTranslations]);
</script>

<CustomElement bind:value bind:config bind:context bind:disabled>
  {#if loading}
    <Loading />
  {:else}
    <div transition:fade>
      {#if !disabled}
        <div class="group">
          <button class="button" on:click={clone}>{$t('clone')}</button>
        </div>
      {:else}
        <div class="group">{$t('noFunctionality')}</div>
      {/if}
      {#if responseError}
        <div class="group">{responseError}</div>
      {/if}
      {#if response && !responseError}
        <div class="group" transition:fade>
          <div class="group column item">
            <div class="label">{$t('totalTime')}</div>
            <span>{totalTime}</span>
          </div>
          <div class="group column item">
            <div class="label">{$t('totalApiCalls')}</div>
            <span>{response.totalApiCalls}</span>
          </div>
        </div>
        <div class="group">
          <div class="group column item">
            <div class="label">{$t('newItems')}</div>
            {#each response.newItems as newItem (newItem.id)}
              <span>
                <a
                  href={`https://app.kontent.ai/${context.projectId}/content-inventory/${context.variant.id}/content/${newItem.id}`}
                  target="_blank"
                  rel="noopener noreferrer">
                  {newItem.name}
                </a>
              </span>
            {/each}
          </div>
        </div>
      {/if}
    </div>
  {/if}
  <div slot="loading">
    <Loading />
  </div>
  <div slot="invalid">
    <Invalid />
  </div>
</CustomElement>

<style>
  .item {
    flex: 1;
  }
</style>
