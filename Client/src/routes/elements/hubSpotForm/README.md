# HubSpot form

This contains code for the HubSpot form custom element.

This element requires these backend functions:

- [KenticoKontentKonservatory/Functions/Elements/HubspotGetForms.cs](https://github.com/yuriys-kentico/KenticoKontentKonservatory/blob/main/Functions/Elements/HubspotGetForms.cs)

## Steps to deploy

1. Clone this repository:
   - Locally, then run `npm i`, `npm run build` and `npm run start`.
   - On Vercel: [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/git/external?repository-url=https%3A%2F%2Fgithub.com%2Fyuriys-kentico%2FKenticoKontentKonservatory%2F&env=KONTENT_PROJECTID,KONTENT_PREVIEWAPIKEY).
1. Open `Functions.sln` in Visual Studio and publish the `Functions` project to an Azure Function App.
1. Use `~/elements/hubSpotForm` as the host route.
