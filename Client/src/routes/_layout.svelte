<script context="module" lang="ts">
  import type { Preload } from "@sapper/app";
  import type { ISession } from "../shared/kontent";
  import { deliveryClient } from "../shared/kontent";
  import { Translation } from "../shared/models/Translation";
  import type { Site } from "../shared/models/Site";

  export const preload: Preload<{}, ISession> = async function (
    this,
    page,
    session
  ) {
    const site = (
      await deliveryClient(session.kontent)
        .item<Site>("site")
        .depthParameter(6)
        .toPromise()
    ).item;

    const translations = (
      await deliveryClient(session.kontent)
        .items<Translation>()
        .type(Translation.codename)
        .toPromise()
    ).items.reduce((translations, translation) => {
      translations[translation.system.codename] = translation.content.value;
      return translations;
    }, {});

    if (
      site === undefined ||
      translations === {} ||
      session.kontent === undefined ||
      session.kontent.projectId === undefined
    ) {
      throw Error("Session was not injected as expected");
    }

    session.kontent.site = site.getModel();
    session.kontent.translations = { en_us: { translation: translations } };

    return {};
  };
</script>

<script lang="ts">
  import { stores } from "@sapper/app";

  const { page, session } = stores<ISession>();

  const nakedRoutes = $session.kontent.site.routes.reduce<string[]>(
    (nakedRoutes, route) => {
      if (route.options.some((option) => option === "naked")) {
        nakedRoutes.push(`/${route.route}/`);
      }

      return nakedRoutes;
    },
    []
  );
</script>

<svelte:head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1.0" />
  <meta name="theme-color" content="#333333" />
  <link rel="icon" type="image/png" href="favicon.png" />
  <title>{$session.kontent.site.name}</title>
</svelte:head>

{#if nakedRoutes.some((route) => $page.path.startsWith(route))}
  <slot />
{:else}
  <h1>{$session.kontent.site.name}</h1>
  <slot />
{/if}

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

  h1 {
    text-align: center;
    font-size: 5em;
    text-transform: uppercase;
    font-weight: 700;
    margin: 0 0 0.5em 0;
  }

  :global(a) {
    color: inherit;
  }

  :global(*) {
    box-sizing: border-box;
  }

  :global(section) {
    display: flex;
    flex-direction: column;
    max-width: 1600px;
    margin: 0 auto;
  }

  @media (max-width: 1600px) {
    :global(section) {
      max-width: 800px;
    }
  }

  @media (max-width: 800px) {
    h1 {
      font-size: 3em;
    }
  }

  @media (min-width: 400px) {
    :global(body) {
      font-size: 16px;
    }
  }
</style>
