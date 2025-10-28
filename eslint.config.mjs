import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const annotateParser = (parser, fallbackName) => {
  if (!parser || typeof parser !== "object") {
    return parser;
  }

  const name =
    parser.meta?.name ??
    parser.name ??
    fallbackName;

  if (!name) {
    return parser;
  }

  return {
    ...parser,
    meta: {
      ...parser.meta,
      name,
    },
  };
};

const patchLanguageOptions = (languageOptions, fallbackName) => {
  if (!languageOptions || typeof languageOptions !== "object") {
    return languageOptions;
  }

  if (!languageOptions.parser) {
    return languageOptions;
  }

  return {
    ...languageOptions,
    parser: annotateParser(languageOptions.parser, fallbackName),
  };
};

const patchConfigEntry = (entry) => {
  const patched = { ...entry };

  if (patched.languageOptions) {
    patched.languageOptions = patchLanguageOptions(
      patched.languageOptions,
      "@next/eslint-parser"
    );
  }

  if (Array.isArray(patched.overrides)) {
    patched.overrides = patched.overrides.map((override) => {
      if (!override.languageOptions) {
        return override;
      }

      const isTypeScriptOverride =
        Array.isArray(override.files) &&
        override.files.some((pattern) => pattern.includes(".ts"));

      return {
        ...override,
        languageOptions: patchLanguageOptions(
          override.languageOptions,
          isTypeScriptOverride
            ? "@typescript-eslint/parser"
            : "@next/eslint-parser"
        ),
      };
    });
  }

  return patched;
};

const eslintConfig = [...compat.extends("next/core-web-vitals")].map(
  patchConfigEntry
);

export default eslintConfig;
