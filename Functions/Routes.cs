namespace Functions
{
    public static class Routes
    {
        public const string KontentAzureTranslate = "webhooks/translate/{languageCodename}";
        public const string HubSpotGetForms = "integrations/hubSpot/getForms";
        public const string KontentClone = "elements/clone/{itemCodename}/{languageCodename}";
        public const string KontentChangeType = "elements/changeType/{itemCodename}/{languageCodename}/{typeId}";
        public const string KontentGetTypes = "elements/getTypes/{itemCodename}";
    }
}