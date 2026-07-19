import { parseUtmParams } from "./utm";

describe("parseUtmParams", () => {
  it("extracts all three params from a query string", () => {
    expect(
      parseUtmParams("?utm_source=newsletter&utm_medium=email&utm_campaign=launch"),
    ).toEqual({
      utm_source: "newsletter",
      utm_medium: "email",
      utm_campaign: "launch",
    });
  });

  it("returns null for missing params", () => {
    expect(parseUtmParams("?utm_source=google")).toEqual({
      utm_source: "google",
      utm_medium: null,
      utm_campaign: null,
    });
  });

  it("returns all-null for a query string with no UTM params", () => {
    expect(parseUtmParams("?foo=bar")).toEqual({
      utm_source: null,
      utm_medium: null,
      utm_campaign: null,
    });
  });

  it("returns all-null for an empty query string", () => {
    expect(parseUtmParams("")).toEqual({
      utm_source: null,
      utm_medium: null,
      utm_campaign: null,
    });
  });

  it("ignores unrelated params mixed in with UTM params", () => {
    expect(
      parseUtmParams("?ref=abc&utm_source=twitter&session=xyz&utm_medium=social"),
    ).toEqual({
      utm_source: "twitter",
      utm_medium: "social",
      utm_campaign: null,
    });
  });

  it("works when given a full mocked URL's search string", () => {
    const mockedUrl = new URL(
      "https://saasok.example/?utm_source=partner&utm_medium=cpc&utm_campaign=spring26",
    );
    expect(parseUtmParams(mockedUrl.search)).toEqual({
      utm_source: "partner",
      utm_medium: "cpc",
      utm_campaign: "spring26",
    });
  });
});
