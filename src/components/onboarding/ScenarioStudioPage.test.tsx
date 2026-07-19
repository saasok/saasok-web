import { render, screen, fireEvent } from "@testing-library/react";
import { useOnboardingStore } from "@/store/onboarding";
import { ScenarioStudioPage } from "./ScenarioStudioPage";
import { SCENARIOS } from "@/lib/scenarios";

function setup(overrides: Partial<ReturnType<typeof useOnboardingStore.getState>> = {}) {
  useOnboardingStore.setState({
    brokers: ["INTERACTIVE BROKERS (IBKR)"],
    risk: "moderate",
    ...overrides,
  });
  const onNext = jest.fn();
  const onPrev = jest.fn();
  render(<ScenarioStudioPage onNext={onNext} onPrev={onPrev} />);
  return { onNext, onPrev };
}

beforeEach(() => {
  useOnboardingStore.getState().reset();
});

describe("ScenarioStudioPage guard", () => {
  it("shows a completion prompt instead of the sandbox when onboarding is incomplete", () => {
    useOnboardingStore.setState({ brokers: [], risk: null });
    render(
      <ScenarioStudioPage onNext={jest.fn()} onPrev={jest.fn()} />,
    );
    expect(
      screen.getByText("Complete onboarding to see your scenario sandbox."),
    ).toBeInTheDocument();
  });
});

describe("scenario selection highlighting", () => {
  // "Inflation returns / stagflation" (index 2): AAPL/MSFT green, TSLA/TSM
  // red, and AMZN is untagged at this horizon so it should render gray.
  it("colors known positions green/red/gray per the scenario's tag map", () => {
    setup();
    fireEvent.click(screen.getByTestId("scen-card-2"));

    expect(screen.getByTestId("scen-position-AAPL")).toHaveAttribute(
      "data-highlight",
      "green",
    );
    expect(screen.getByTestId("scen-position-MSFT")).toHaveAttribute(
      "data-highlight",
      "green",
    );
    expect(screen.getByTestId("scen-position-TSLA")).toHaveAttribute(
      "data-highlight",
      "red",
    );
    expect(screen.getByTestId("scen-position-TSM")).toHaveAttribute(
      "data-highlight",
      "red",
    );
    expect(screen.getByTestId("scen-position-AMZN")).toHaveAttribute(
      "data-highlight",
      "gray",
    );
  });

  it("updates the detail panel to the selected scenario's copy", () => {
    setup();
    fireEvent.click(screen.getByTestId("scen-card-2"));

    expect(screen.getByTestId("scen-detail-title")).toHaveTextContent(
      `${SCENARIOS[2].title} — 5 years`,
    );
    expect(screen.getByTestId("scen-detail-text")).toHaveTextContent(
      SCENARIOS[2].y5.txt,
    );
  });

  it("reset clears all highlighting and restores the placeholder detail copy", () => {
    setup();
    fireEvent.click(screen.getByTestId("scen-card-2"));
    fireEvent.click(screen.getByTestId("scen-reset"));

    expect(screen.getByTestId("scen-position-AAPL")).toHaveAttribute(
      "data-highlight",
      "none",
    );
    expect(screen.getByTestId("scen-position-TSLA")).toHaveAttribute(
      "data-highlight",
      "none",
    );
    expect(screen.getByText("Pick a scenario")).toBeInTheDocument();
  });
});

describe("horizon switching", () => {
  // "AI performance supercycle" (index 0): AAPL is green at 5yr but untagged
  // (gray) at 10yr, while NVDA is the reverse — untagged at 5yr, green at 10yr.
  it("re-renders highlights and copy for the same scenario under the new horizon", () => {
    setup();
    fireEvent.click(screen.getByTestId("scen-card-0"));

    expect(screen.getByTestId("scen-position-AAPL")).toHaveAttribute(
      "data-highlight",
      "green",
    );
    expect(screen.getByTestId("scen-position-NVDA")).toHaveAttribute(
      "data-highlight",
      "gray",
    );
    expect(screen.getByTestId("scen-detail-text")).toHaveTextContent(
      SCENARIOS[0].y5.txt,
    );

    fireEvent.click(screen.getByTestId("scen-horizon-10"));

    expect(screen.getByTestId("scen-position-AAPL")).toHaveAttribute(
      "data-highlight",
      "gray",
    );
    expect(screen.getByTestId("scen-position-NVDA")).toHaveAttribute(
      "data-highlight",
      "green",
    );
    expect(screen.getByTestId("scen-detail-title")).toHaveTextContent(
      `${SCENARIOS[0].title} — 10 years`,
    );
    expect(screen.getByTestId("scen-detail-text")).toHaveTextContent(
      SCENARIOS[0].y10.txt,
    );
  });
});

describe("navigation", () => {
  it("calls onPrev/onNext from the arrow buttons", () => {
    const { onNext, onPrev } = setup();
    fireEvent.click(screen.getByTestId("scen-prev-arrow"));
    fireEvent.click(screen.getByTestId("scen-next-arrow"));
    expect(onPrev).toHaveBeenCalledTimes(1);
    expect(onNext).toHaveBeenCalledTimes(1);
  });
});
