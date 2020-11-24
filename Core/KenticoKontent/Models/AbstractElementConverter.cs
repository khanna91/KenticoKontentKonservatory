using System;
using System.Linq;

using Core.KenticoKontent.Models.Management.Elements;

using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace Core.KenticoKontent.Models
{
    internal class AbstractElementConverter : JsonConverter<AbstractElement>
    {
        public override AbstractElement? ReadJson(JsonReader reader, Type objectType, AbstractElement? existingValue, bool hasExistingValue, JsonSerializer serializer)
        {
            if (reader.TokenType != JsonToken.StartObject)
            {
                return null;
            }

            serializer.ContractResolver = new SubclassResolver<AbstractElement>();

            var element = JObject.Load(reader);

            if (element.ContainsKey(nameof(RichTextElement.Components).ToLower()))
            {
                return element.ToObject<RichTextElement>(serializer);
            }

            if (element.ContainsKey(nameof(CustomElement.Searchable_Value).ToLower()))
            {
                return element.ToObject<CustomElement>(serializer);
            }

            if (element.ContainsKey(nameof(UrlSlugElement.Mode).ToLower()))
            {
                return element.ToObject<UrlSlugElement>(serializer);
            }

            return (element["value"]?.Type) switch
            {
                JTokenType.String => element.ToObject<TextElement>(serializer),
                JTokenType.Float => element.ToObject<NumberElement>(serializer),
                JTokenType.Date => element.ToObject<DateTimeElement>(serializer),
                JTokenType.Array => element.ToObject<AbstractReferenceListElement>(serializer),
                _ => element.ToObject<AbstractElement>(serializer),
            };
        }

        public override bool CanWrite => false;

        public override void WriteJson(JsonWriter writer, AbstractElement? value, JsonSerializer serializer) => throw new NotImplementedException();
    }
}