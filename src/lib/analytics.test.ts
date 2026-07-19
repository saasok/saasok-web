import { trackEvent } from "./analytics";

describe("trackEvent", () => {
  afterEach(() => {
    delete window.gtag;
  });

  it("forwards the event name and payload to window.gtag", () => {
    window.gtag = jest.fn();

    trackEvent("scenario_click", { scenario: "AI performance supercycle" });

    expect(window.gtag).toHaveBeenCalledTimes(1);
    expect(window.gtag).toHaveBeenCalledWith("event", "scenario_click", {
      scenario: "AI performance supercycle",
    });
  });

  it("defaults to an empty payload when none is given", () => {
    window.gtag = jest.fn();

    trackEvent("save_results_click");

    expect(window.gtag).toHaveBeenCalledWith("event", "save_results_click", {});
  });

  it("does not throw when window.gtag is not defined (script not loaded / SSR)", () => {
    expect(() => trackEvent("geo_lookup", { country: "Germany" })).not.toThrow();
  });
});
