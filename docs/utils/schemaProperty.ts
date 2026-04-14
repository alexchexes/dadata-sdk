import type { JSONSchema7, JSONSchema7Definition } from 'json-schema';

export type SchemaDocLang = 'en' | 'ru';

const LOCALE_TAG_RE = /^@locale\s+([a-z-]+)\s*$/i;

const getSchemaDefinitionObject = (schema: JSONSchema7, definition: string) => {
  const def = schema.definitions?.[definition];
  return def && typeof def === 'object' ? def : undefined;
};

const getSchemaProperties = (schema: JSONSchema7, definition: string) => {
  const def = getSchemaDefinitionObject(schema, definition);
  return def?.properties;
};

const getSchemaPropertyDefinition = (definition: JSONSchema7Definition | undefined) =>
  definition && typeof definition === 'object' ? (definition as JSONSchema7) : undefined;

export const resolveSchemaPropertyName = (
  schema: JSONSchema7,
  definition: string,
  property: string,
) => {
  const properties = getSchemaProperties(schema, definition);

  if (!properties) {
    return undefined;
  }

  const exactMatch = getSchemaPropertyDefinition(properties[property]);
  if (exactMatch) {
    return property;
  }

  const lowerProperty = property.toLowerCase();
  return Object.keys(properties).find((key) => {
    const candidate = getSchemaPropertyDefinition(properties[key]);
    return !!candidate && key.toLowerCase() === lowerProperty;
  });
};

export const getSchemaPropertyData = (
  schema: JSONSchema7,
  definition: string,
  property: string,
) => {
  const properties = getSchemaProperties(schema, definition);
  const resolvedProperty = resolveSchemaPropertyName(schema, definition, property);

  if (!properties || !resolvedProperty) {
    return {};
  }

  return getSchemaPropertyDefinition(properties[resolvedProperty]) || {};
};

const getRefName = (refLink: string) => refLink.replace('#/definitions/', '');

const getRefType = (schema: JSONSchema7, refLink: string) => {
  const refName = getRefName(refLink);
  const refObj = schema.definitions?.[refName];
  if (!refObj || typeof refObj !== 'object') {
    return [];
  }
  return getSchemaPropertyTypes(schema, refObj as JSONSchema7);
};

export const getSchemaPropertyTypes = (
  schema: JSONSchema7,
  propertyData: JSONSchema7,
): string[] => {
  let types: unknown[] = [];

  if (Array.isArray(propertyData.type)) {
    types = propertyData.type;
  } else if (propertyData.anyOf) {
    types = propertyData.anyOf.map((item) => getSchemaPropertyTypes(schema, item as JSONSchema7));
  } else if (propertyData.$ref) {
    types = [`${getRefName(propertyData.$ref)} (${getRefType(schema, propertyData.$ref)})`];
  } else {
    types = [propertyData.type];
  }

  return types
    .filter(Boolean)
    .map((typeValue) =>
      Array.isArray(typeValue) && typeValue.length > 1
        ? `(${typeValue.join(' | ')})`
        : String(typeValue),
    );
};

export const splitLocalizedDescription = (description: string) => {
  const sections: Partial<Record<'default' | 'en' | 'ru', string>> = {};
  let currentSection: 'default' | 'en' | 'ru' = 'default';
  let chunk: string[] = [];

  const flush = () => {
    const text = chunk.join('\n').trim();
    if (text) {
      sections[currentSection] = text;
    }
    chunk = [];
  };

  description
    .replace(/\r\n/g, '\n')
    .split('\n')
    .forEach((line) => {
      const localeMatch = line.match(LOCALE_TAG_RE);

      if (localeMatch) {
        flush();
        currentSection = localeMatch[1].toLowerCase() === 'ru' ? 'ru' : 'en';
        return;
      }

      chunk.push(line);
    });

  flush();
  return sections;
};

export const getLocalizedSchemaDescription = (description?: string, lang: SchemaDocLang = 'en') => {
  if (!description) {
    return '';
  }

  const sections = splitLocalizedDescription(description);
  return sections[lang] || sections.default || description;
};
