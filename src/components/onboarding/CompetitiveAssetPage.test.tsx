import { fireEvent, render, screen } from "@testing-library/react";
import { COMPETITIVE_ASSETS } from "@/lib/competitiveAssets";
import { CompetitiveAssetPage } from "./CompetitiveAssetPage";

describe("CompetitiveAssetPage", () => {
  it("defaults to the first asset selected", () => {
    render(<CompetitiveAssetPage onNext={() => {}} onPrev={() => {}} />);

    expect(
      screen.getByTestId(`asset-item-${COMPETITIVE_ASSETS[0].ticker}`),
    ).toHaveAttribute("data-active", "true");
    expect(screen.getByTestId("asset-mockup-name")).toHaveTextContent(
      COMPETITIVE_ASSETS[0].name,
    );
  });

  it("selecting a new asset deselects the previous one", () => {
    render(<CompetitiveAssetPage onNext={() => {}} onPrev={() => {}} />);

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
    render(<CompetitiveAssetPage onNext={() => {}} onPrev={() => {}} />);

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
    render(<CompetitiveAssetPage onNext={onNext} onPrev={onPrev} />);

    fireEvent.click(screen.getByTestId("competitive-prev-arrow"));
    fireEvent.click(screen.getByTestId("competitive-next-arrow"));

    expect(onPrev).toHaveBeenCalledTimes(1);
    expect(onNext).toHaveBeenCalledTimes(1);
  });
});
