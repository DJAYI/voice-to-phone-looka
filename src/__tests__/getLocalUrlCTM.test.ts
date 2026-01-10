import config from "../../.astro/config.generated.json";
import { getLocaleUrlCTM } from "../lib/utils/i18nUtils";

const paths = [
  "http://localhost:4321",
  "http://localhost:4321/en",
  "http://localhost:4321/zh",
  "http://localhost:4321/rates",
  "http://localhost:4321/en/rates",
  "http://localhost:4321/zh/rates",
  "http://localhost:4321/frog",
  "http://localhost:4321/zh/frog",
  "http://localhost:4321/en/engineer",

  "",
  "/en",
  "/zh",
  "/en/rates",
  "/zh/rates",
  "/zh/frog",
  "/en/engineer",
  "/engineer",
  "/frog",
  "/rates",

  "http://localhost:4321/",
  "http://localhost:4321/en/",
  "http://localhost:4321/zh/",
  "http://localhost:4321/en/rates/",
  "http://localhost:4321/zh/rates/",
  "http://localhost:4321/zh/frog/",
  "http://localhost:4321/en/engineer/",
  "http://localhost:4321/frog/",
  "http://localhost:4321/engineer/",

  "/",
  "/en/",
  "/zh/",
  "/en/rates/",
  "/zh/rates/",
  "/zh/frog/",
  "/en/engineer/",
  "/frog/",
  "/engineer/",
];

const {
  settings: {
    multilingual: { defaultLanguage, showDefaultLangInUrl },
  },
  site: { trailingSlash },
} = config;

describe("getLocaleUrlCTM", () => {
  const prependValue = "case-studies";

  test.each(paths)("Handles URL: %s", (path) => {
    const resultWithDefaultLang = getLocaleUrlCTM(path, "en", prependValue);
    const resultWithOtherLang = getLocaleUrlCTM(path, "zh", prependValue);

    // Split the URL into segments for precise checks
    const defaultLangSegments = resultWithDefaultLang.split("/");
    const otherLangSegments = resultWithOtherLang.split("/");

    if (!showDefaultLangInUrl && defaultLanguage === "en") {
      // Check if "/en" exists as a standalone segment
      expect(defaultLangSegments.includes("en")).toBe(false);
    } else {
      // Ensure "/en" is not present for the default language
      expect(defaultLangSegments.includes("en")).toBe(true);

      // Check if "/zh" exists as a standalone segment for the other language
      expect(otherLangSegments.includes("zh")).toBe(true);
    }

    // Ensure trailing slash is as per configuration
    expect(resultWithDefaultLang.endsWith("/")).toBe(trailingSlash);
    expect(resultWithOtherLang.endsWith("/")).toBe(trailingSlash);
  });

  test("Handles absolute URLs and preserves anchors", () => {
    const url = "http://localhost:4321/en/rates/#example-anchor";
    const result = getLocaleUrlCTM(url, "en", prependValue);
    expect(result).toBe(
      "http://localhost:4321/case-studies/rates/#example-anchor",
    );
  });

  test("Handles relative URL file extension in URL", () => {
    const url = "en/case-studies-01.mdx";
    const result = getLocaleUrlCTM(url, "en", prependValue);
    const expected =
      showDefaultLangInUrl && defaultLanguage === "en"
        ? "/en/case-studies/case-studies-01/"
        : "/case-studies/case-studies-01/";
    expect(result).toBe(expected);
  });

  test("Handles relative URL with language directory in URL", () => {
    const url = "chinese/case-studies-01";
    const result = getLocaleUrlCTM(url, "en", prependValue);
    const expected =
      showDefaultLangInUrl && defaultLanguage === "en"
        ? "/en/case-studies/case-studies-01/"
        : "/case-studies/case-studies-01/";
    expect(result).toBe(expected);
  });

  test("Prepends optional value correctly", () => {
    const url = "/rates";
    const result = getLocaleUrlCTM(url, "es", prependValue);
    expect(result).toBe("/es/case-studies/rates/");
  });

  test("Handles root URL with default language", () => {
    const url = "/";
    const result = getLocaleUrlCTM(url, "en", prependValue);
    const expected =
      showDefaultLangInUrl && defaultLanguage === "en"
        ? "/en/case-studies/"
        : "/case-studies/";
    expect(result).toBe(expected);
  });

  test("Don't handle external url", () => {
    const url = "https://example.com";
    const result = getLocaleUrlCTM(url, "en", prependValue);
    const expected =
      showDefaultLangInUrl && defaultLanguage === "en"
        ? "https://example.com"
        : "https://example.com";
    expect(result).toBe(expected);
  });
});
