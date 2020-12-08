<script context="module" lang="ts">
  import type { Preload } from "./_sapper";
  import type { ISession } from "../shared/kontent";
  import { deliveryClient } from "../shared/kontent";
  import { Translation } from "../shared/models/Translation";
  import type { Site } from "../shared/models/Site";

  export const preload: Preload<{}, ISession> = async function (
    this,
    page,
    session
  ) {
    const site = await deliveryClient(session.kontent)
      .item<Site>("site")
      .toPromise();

    session.kontent.site = { name: site.item.name.value };

    const translations = (
      await deliveryClient(session.kontent)
        .items<Translation>()
        .type(Translation.codeName)
        .toPromise()
    ).items.reduce((translations, translation) => {
      translations[translation.system.codename] = translation.content.value;
      return translations;
    }, {});

    session.kontent.translations = { en_us: { translation: translations } };

    return {};
  };
</script>

<script lang="ts">
</script>

<svelte:head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1.0" />
  <meta name="theme-color" content="#333333" />
  <link rel="icon" type="image/png" href="favicon.png" />
</svelte:head>

<slot />

<style>
  :global(body) {
    margin: 0;
    font-family: Roboto, -apple-system, BlinkMacSystemFont, Segoe UI, Oxygen,
      Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
    font-size: 14px;
    line-height: 1.5;
    color: #333;
  }

  :global(main) {
    position: relative;
    margin: 0 auto;
    box-sizing: border-box;
  }

  :global(h1),
  :global(h2),
  :global(h3),
  :global(h4),
  :global(h5),
  :global(h6) {
    margin: 0 0 0.5em 0;
    line-height: 1.2;
  }

  :global(a) {
    color: inherit;
  }

  :global(*) {
    box-sizing: border-box;
  }

  :global(section) {
    display: flex;
    max-width: 1600px;
    margin: 0 auto;
  }

  @media (min-width: 400px) {
    :global(body) {
      font-size: 16px;
    }
  }
</style>
