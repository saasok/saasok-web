import { fireEvent, render, screen } from "@testing-library/react";
import { useOnboardingStore } from "@/store/onboarding";
import { getPortfolio } from "@/lib/portfolio";
import { DashboardPage } from "./DashboardPage";

function formatUsd(value: number): string {
  return "$" + Math.round(value).toLocaleString("en-US");
}

describe("DashboardPage", () => {
  beforeEach(() => {
    useOnboardingStore.getState().reset();
  });

  it("renders the expected total and position count for a fixed 2-broker selection", () => {
    const brokers = ["INTERACTIVE BROKERS (IBKR)", "SAXO"] as const;
    useOnboardingStore.setState({
      brokers: [...brokers],
      risk: "moderate",
      years: "5-9",
    });
    const expected = getPortfolio([...brokers], "moderate");

    render(<DashboardPage onNext={() => {}} />);

    expect(screen.getByTestId("dashboard-broker-label")).toHaveTextContent(
      expected.brokerLabel,
    );
    expect(screen.getByTestId("dashboard-total")).toHaveTextContent(
      formatUsd(expected.total),
    );
    expect(screen.getAllByTestId(/^dashboard-position-/)).toHaveLength(
      expected.positions.length,
    );
  });

  it("shows a red-dot loss indicator only on underwater positions", () => {
    useOnboardingStore.setState({
      brokers: ["SAXO"],
      risk: "conservative",
      years: "1-4",
    });
    const expected = getPortfolio(["SAXO"], "conservative");

    render(<DashboardPage onNext={() => {}} />);

    expected.positions.forEach((p) => {
      const dot = screen.queryByTestId(`dashboard-loss-dot-${p.symbol}`);
      if (p.underwater) {
        expect(dot).toBeInTheDocument();
      } else {
        expect(dot).not.toBeInTheDocument();
      }
    });
  });

  it("renders an empty state instead of crashing when onboarding state is incomplete", () => {
    render(<DashboardPage onNext={() => {}} />);
    expect(screen.getByText(/Complete onboarding/)).toBeInTheDocument();
  });

  it("calls onNext when the right-edge arrow is clicked", () => {
    useOnboardingStore.setState({
      brokers: ["XTB"],
      risk: "aggressive",
      years: "10+",
    });
    const onNext = jest.fn();
    render(<DashboardPage onNext={onNext} />);

    fireEvent.click(screen.getByTestId("dashboard-next-arrow"));
    expect(onNext).toHaveBeenCalledTimes(1);
  });
});
