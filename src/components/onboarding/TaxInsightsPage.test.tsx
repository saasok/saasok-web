import { fireEvent, screen } from "@testing-library/react";
import { useOnboardingStore } from "@/store/onboarding";
import { getPortfolio, getCapitalGainsTax, type Broker } from "@/lib/portfolio";
import { renderWithIntl } from "@/test/renderWithIntl";
import { TaxInsightsPage } from "./TaxInsightsPage";

const BANNED_IMPERATIVE_PATTERNS = [
  /\byou should\b/i,
  /\bshould sell\b/i,
  /\bshould buy\b/i,
  /\bsell now\b/i,
  /\bbuy now\b/i,
  /\bwe recommend\b/i,
  /\bour recommendation\b/i,
  /\byou must\b/i,
  /\bneed to sell\b/i,
];

function formatUsd(value: number): string {
  return "$" + Math.round(value).toLocaleString("en-US");
}

function setup(overrides: {
  brokers?: string[];
  risk?: "conservative" | "moderate" | "aggressive";
  residency?: "EU" | "UK" | "US" | "UAE" | "CH" | "UA" | null;
}) {
  useOnboardingStore.setState({
    brokers: overrides.brokers ?? ["INTERACTIVE BROKERS (IBKR)"],
    risk: overrides.risk ?? "moderate",
    residency: overrides.residency ?? null,
  });
}

describe("TaxInsightsPage", () => {
  beforeEach(() => {
    useOnboardingStore.getState().reset();
  });

  it("shows the residency gate and no blocks when residency is unset", () => {
    setup({});
    renderWithIntl(<TaxInsightsPage onNext={() => {}} onPrev={() => {}} />);

    expect(screen.getByTestId("tax-residency-gate")).toBeInTheDocument();
    expect(screen.queryByTestId("tax-blocks")).not.toBeInTheDocument();
  });

  it("clicking a residency option hides the gate and shows all three blocks", () => {
    setup({});
    renderWithIntl(<TaxInsightsPage onNext={() => {}} onPrev={() => {}} />);

    fireEvent.click(screen.getByTestId("tax-residency-UK"));

    expect(screen.queryByTestId("tax-residency-gate")).not.toBeInTheDocument();
    expect(screen.getByTestId("tax-block-tloss")).toBeInTheDocument();
    expect(screen.getByTestId("tax-block-calc")).toBeInTheDocument();
    expect(screen.getByTestId("tax-block-fees")).toBeInTheDocument();
  });

  it("skips the gate entirely when residency is already set (ratchet)", () => {
    setup({ residency: "US" });
    renderWithIntl(<TaxInsightsPage onNext={() => {}} onPrev={() => {}} />);

    expect(screen.queryByTestId("tax-residency-gate")).not.toBeInTheDocument();
    expect(screen.getByTestId("tax-blocks")).toBeInTheDocument();
  });

  it("renders the top-of-page tax footnote disclaimer", () => {
    setup({ residency: "US" });
    renderWithIntl(<TaxInsightsPage onNext={() => {}} onPrev={() => {}} />);

    expect(screen.getByTestId("tax-footnote")).toHaveTextContent(
      /illustrative and based on publicly available data/,
    );
  });

  describe("Tax-Loss Opportunities block", () => {
    it("marks underwater positions as losses and others as —, and toggles the expand tip", () => {
      const brokers: Broker[] = ["SAXO"];
      setup({ brokers, risk: "conservative", residency: "US" });
      const expected = getPortfolio(brokers, "conservative");

      renderWithIntl(<TaxInsightsPage onNext={() => {}} onPrev={() => {}} />);

      expected.positions.forEach((p) => {
        const row = screen.getByTestId(`tax-loss-row-${p.symbol}`);
        if (p.underwater) {
          expect(row).toHaveTextContent(/%$/);
          expect(
            screen.queryByTestId(`tax-loss-tip-${p.symbol}`),
          ).not.toBeInTheDocument();
          fireEvent.click(row);
          const tip = screen.getByTestId(`tax-loss-tip-${p.symbol}`);
          expect(tip).toBeInTheDocument();
          fireEvent.click(row);
          expect(
            screen.queryByTestId(`tax-loss-tip-${p.symbol}`),
          ).not.toBeInTheDocument();
        } else {
          expect(row).toHaveTextContent("—");
        }
      });
    });

    it("closes only the tax-loss block when its close-X is clicked", () => {
      setup({ residency: "US" });
      renderWithIntl(<TaxInsightsPage onNext={() => {}} onPrev={() => {}} />);

      fireEvent.click(screen.getByTestId("tax-close-tloss"));

      expect(screen.queryByTestId("tax-block-tloss")).not.toBeInTheDocument();
      expect(screen.getByTestId("tax-block-calc")).toBeInTheDocument();
      expect(screen.getByTestId("tax-block-fees")).toBeInTheDocument();
    });

    describe("compliance copy", () => {
      it("contains no imperative/advisory phrasing and matches the fixed copy exactly", () => {
        const brokers: Broker[] = ["SAXO"];
        setup({ brokers, risk: "conservative", residency: "US" });
        const expected = getPortfolio(brokers, "conservative");
        const lossSymbol = expected.positions.find((p) => p.underwater)!.symbol;

        renderWithIntl(<TaxInsightsPage onNext={() => {}} onPrev={() => {}} />);
        fireEvent.click(screen.getByTestId(`tax-loss-row-${lossSymbol}`));

        const copy = screen.getByTestId(`tax-loss-copy-${lossSymbol}`)
          .textContent as string;

        BANNED_IMPERATIVE_PATTERNS.forEach((re) => {
          expect(copy).not.toMatch(re);
        });
        expect(copy).toBe(
          "Selling this position could help offset gains elsewhere. Educational information only — not a recommendation.",
        );
      });
    });
  });

  describe("Tax Impact Before Trades block", () => {
    it("shows placeholder copy for an empty amount", () => {
      setup({ residency: "UK" });
      renderWithIntl(<TaxInsightsPage onNext={() => {}} onPrev={() => {}} />);

      expect(screen.getByTestId("tax-calc-result")).toHaveTextContent(
        "Enter an amount to see the estimated range.",
      );
    });

    it("computes the correct CGT range for a fixed residency and amount", () => {
      setup({ residency: "UK" });
      renderWithIntl(<TaxInsightsPage onNext={() => {}} onPrev={() => {}} />);

      fireEvent.change(screen.getByTestId("tax-sell-amount"), {
        target: { value: "100000" },
      });

      const cgt = getCapitalGainsTax("UK");
      const expectedLow = formatUsd(100000 * cgt.typicalRateLow);
      const expectedHigh = formatUsd(100000 * cgt.typicalRateHigh);

      const result = screen.getByTestId("tax-calc-result").textContent as string;
      expect(result).toContain("UK");
      expect(result).toContain(expectedLow);
      expect(result).toContain(expectedHigh);
    });

    it("closes only the calculator block when its close-X is clicked", () => {
      setup({ residency: "US" });
      renderWithIntl(<TaxInsightsPage onNext={() => {}} onPrev={() => {}} />);

      fireEvent.click(screen.getByTestId("tax-close-calc"));

      expect(screen.queryByTestId("tax-block-calc")).not.toBeInTheDocument();
      expect(screen.getByTestId("tax-block-tloss")).toBeInTheDocument();
      expect(screen.getByTestId("tax-block-fees")).toBeInTheDocument();
    });
  });

  describe("Reduce Unnecessary Tax Costs block", () => {
    it.each([
      [["INTERACTIVE BROKERS (IBKR)"]],
      [["INTERACTIVE BROKERS (IBKR)", "SAXO"]],
      [["INTERACTIVE BROKERS (IBKR)", "SAXO", "XTB"]],
    ])("renders one tab per selected broker for %j", (brokers) => {
      setup({ brokers, residency: "US" });
      renderWithIntl(<TaxInsightsPage onNext={() => {}} onPrev={() => {}} />);

      const fees = screen.getByTestId("tax-block-fees");
      const tabs = fees.querySelectorAll(".htab");
      expect(tabs).toHaveLength(brokers.length);
    });

    it("defaults to the first broker's tab and switches tactic text on click, without changing lever text", () => {
      setup({
        brokers: ["INTERACTIVE BROKERS (IBKR)", "SAXO"],
        residency: "UK",
      });
      renderWithIntl(<TaxInsightsPage onNext={() => {}} onPrev={() => {}} />);

      const initialTactic = screen.getByTestId("tax-tactic-text").textContent;
      const leverBefore = screen.getByTestId("tax-lever-text").textContent;

      fireEvent.click(screen.getByTestId("tax-fee-tab-Saxo"));

      const switchedTactic = screen.getByTestId("tax-tactic-text").textContent;
      const leverAfter = screen.getByTestId("tax-lever-text").textContent;

      expect(switchedTactic).not.toBe(initialTactic);
      expect(leverAfter).toBe(leverBefore);
    });

    it("closes only the fees block when its close-X is clicked", () => {
      setup({ residency: "US" });
      renderWithIntl(<TaxInsightsPage onNext={() => {}} onPrev={() => {}} />);

      fireEvent.click(screen.getByTestId("tax-close-fees"));

      expect(screen.queryByTestId("tax-block-fees")).not.toBeInTheDocument();
      expect(screen.getByTestId("tax-block-tloss")).toBeInTheDocument();
      expect(screen.getByTestId("tax-block-calc")).toBeInTheDocument();
    });
  });

  it("calls onPrev and onNext from their respective arrows", () => {
    setup({ residency: "US" });
    const onNext = jest.fn();
    const onPrev = jest.fn();
    renderWithIntl(<TaxInsightsPage onNext={onNext} onPrev={onPrev} />);

    fireEvent.click(screen.getByTestId("tax-prev-arrow"));
    fireEvent.click(screen.getByTestId("tax-next-arrow"));

    expect(onPrev).toHaveBeenCalledTimes(1);
    expect(onNext).toHaveBeenCalledTimes(1);
  });
});
