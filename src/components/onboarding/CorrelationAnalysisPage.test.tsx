import { fireEvent, render, screen } from "@testing-library/react";
import { COMPETITIVE_ASSETS } from "@/lib/competitiveAssets";
import { CorrelationAnalysisPage } from "./CorrelationAnalysisPage";

const TICKERS = COMPETITIVE_ASSETS.map((a) => a.ticker);

describe("CorrelationAnalysisPage", () => {
  it("renders all 20 assets with none centered and no percentage labels by default", () => {
    render(<CorrelationAnalysisPage onNext={() => {}} onPrev={() => {}} />);

    TICKERS.forEach((ticker) => {
      const node = screen.getByTestId(`corr-node-${ticker}`);
      expect(node).toHaveAttribute("data-center", "false");
    });
    expect(screen.queryByTestId("corr-reset")).not.toBeInTheDocument();
    expect(screen.queryAllByTestId(/^corr-pct-/)).toHaveLength(0);
  });

  it("splits the default layout into 10 left / 10 right", () => {
    render(<CorrelationAnalysisPage onNext={() => {}} onPrev={() => {}} />);

    const left = TICKERS.filter(
      (t) => screen.getByTestId(`corr-node-${t}`).getAttribute("data-side") === "left",
    );
    const right = TICKERS.filter(
      (t) => screen.getByTestId(`corr-node-${t}`).getAttribute("data-side") === "right",
    );
    expect(left).toHaveLength(10);
    expect(right).toHaveLength(10);
  });

  it("clicking an asset moves it to the center and shows percentage labels on the rest", () => {
    render(<CorrelationAnalysisPage onNext={() => {}} onPrev={() => {}} />);

    fireEvent.click(screen.getByTestId("corr-node-NVDA"));

    expect(screen.getByTestId("corr-node-NVDA")).toHaveAttribute(
      "data-center",
      "true",
    );
    TICKERS.filter((t) => t !== "NVDA").forEach((ticker) => {
      expect(screen.getByTestId(`corr-node-${ticker}`)).toHaveAttribute(
        "data-center",
        "false",
      );
      expect(screen.getByTestId(`corr-pct-${ticker}`)).toHaveTextContent(/%$/);
    });
    expect(screen.getByTestId("corr-reset")).toBeInTheDocument();
  });

  it("clicking a different asset while one is selected re-centers immediately", () => {
    render(<CorrelationAnalysisPage onNext={() => {}} onPrev={() => {}} />);

    fireEvent.click(screen.getByTestId("corr-node-NVDA"));
    fireEvent.click(screen.getByTestId("corr-node-TSLA"));

    expect(screen.getByTestId("corr-node-TSLA")).toHaveAttribute(
      "data-center",
      "true",
    );
    expect(screen.getByTestId("corr-node-NVDA")).toHaveAttribute(
      "data-center",
      "false",
    );
    expect(screen.getByTestId("corr-pct-NVDA")).toHaveTextContent(/%$/);
  });

  it("reset returns to the default layout with no center and no percentages", () => {
    render(<CorrelationAnalysisPage onNext={() => {}} onPrev={() => {}} />);

    fireEvent.click(screen.getByTestId("corr-node-NVDA"));
    fireEvent.click(screen.getByTestId("corr-reset"));

    TICKERS.forEach((ticker) => {
      expect(screen.getByTestId(`corr-node-${ticker}`)).toHaveAttribute(
        "data-center",
        "false",
      );
    });
    expect(screen.queryByTestId("corr-reset")).not.toBeInTheDocument();
    expect(screen.queryAllByTestId(/^corr-pct-/)).toHaveLength(0);
  });

  it("calls onPrev and onNext from their respective arrows", () => {
    const onNext = jest.fn();
    const onPrev = jest.fn();
    render(<CorrelationAnalysisPage onNext={onNext} onPrev={onPrev} />);

    fireEvent.click(screen.getByTestId("corr-prev-arrow"));
    fireEvent.click(screen.getByTestId("corr-next-arrow"));

    expect(onPrev).toHaveBeenCalledTimes(1);
    expect(onNext).toHaveBeenCalledTimes(1);
  });
});
