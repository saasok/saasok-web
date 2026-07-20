import { fireEvent, screen } from "@testing-library/react";
import { renderWithIntl } from "@/test/renderWithIntl";
import { COMPETITIVE_ASSETS } from "@/lib/competitiveAssets";
import { CompetitiveAssetPage } from "./CompetitiveAssetPage";

jest.mock("../../lib/exportCompetitiveAssets", () => ({
  exportCompetitiveAssetsWorkbook: jest.fn(),
}));

describe("CompetitiveAssetPage", () => {
  it("defaults to the first asset selected", () => {
    renderWithIntl(<CompetitiveAssetPage onNext={() => {}} onPrev={() => {}} />);

    expect(
      screen.getByTestId(`asset-item-${COMPETITIVE_ASSETS[0].ticker}`),
    ).toHaveAttribute("data-active", "true");
    expect(screen.getByTestId("asset-mockup-name")).toHaveTextContent(
      COMPETITIVE_ASSETS[0].name,
    );
  });

  it("selecting a new asset deselects the previous one", () => {
    renderWithIntl(<CompetitiveAssetPage onNext={() => {}} onPrev={() => {}} />);

    const first = COMPETITIVE_ASSETS[0];
    const third = COMPETITIVE_ASSETS[2];

    fireEvent.click(screen.getByTestId(`asset-item-${third.ticker}`));

    expect(screen.getByTestId(`asset-item-${third.ticker}`)).toHaveAttribute(
      "data-active",
      "true",
    );
    expect(screen.getByTestId(`asset-item-${first.ticker}`)).toHaveAttribute(
      "data-active",
      "false",
    );
    expect(screen.getByTestId("asset-mockup-name")).toHaveTextContent(
      third.name,
    );
  });

  it("selecting the same asset twice is idempotent", () => {
    renderWithIntl(<CompetitiveAssetPage onNext={() => {}} onPrev={() => {}} />);

    const fifth = COMPETITIVE_ASSETS[4];
    fireEvent.click(screen.getByTestId(`asset-item-${fifth.ticker}`));
    fireEvent.click(screen.getByTestId(`asset-item-${fifth.ticker}`));

    expect(screen.getByTestId(`asset-item-${fifth.ticker}`)).toHaveAttribute(
      "data-active",
      "true",
    );
    expect(
      screen.getAllByTestId(/^asset-item-/).filter(
        (el) => el.getAttribute("data-active") === "true",
      ),
    ).toHaveLength(1);
    expect(screen.getByTestId("asset-mockup-name")).toHaveTextContent(
      fifth.name,
    );
  });

  it("calls onPrev and onNext from their respective arrows", () => {
    const onNext = jest.fn();
    const onPrev = jest.fn();
    renderWithIntl(<CompetitiveAssetPage onNext={onNext} onPrev={onPrev} />);

    fireEvent.click(screen.getByTestId("competitive-prev-arrow"));
    fireEvent.click(screen.getByTestId("competitive-next-arrow"));

    expect(onPrev).toHaveBeenCalledTimes(1);
    expect(onNext).toHaveBeenCalledTimes(1);
  });

  describe("analytics wiring", () => {
    afterEach(() => {
      delete window.gtag;
    });

    it("tracks asset_click with the clicked ticker", () => {
      window.gtag = jest.fn();
      renderWithIntl(<CompetitiveAssetPage onNext={() => {}} onPrev={() => {}} />);
      const third = COMPETITIVE_ASSETS[2];

      fireEvent.click(screen.getByTestId(`asset-item-${third.ticker}`));

      expect(window.gtag).toHaveBeenCalledWith("event", "asset_click", {
        ticker: third.ticker,
      });
    });

    it("tracks save_results_click when the save button is clicked", () => {
      window.gtag = jest.fn();
      renderWithIntl(<CompetitiveAssetPage onNext={() => {}} onPrev={() => {}} />);

      fireEvent.click(screen.getByTestId("save-results-button"));

      expect(window.gtag).toHaveBeenCalledWith(
        "event",
        "save_results_click",
        {},
      );
    });
  });
});
