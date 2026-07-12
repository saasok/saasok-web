import { fireEvent, render, screen } from "@testing-library/react";
import { PelosiWidget } from "./PelosiWidget";
import pelosiData from "../../../../data/pelosi-trades.json";

const trades = pelosiData.trades;

describe("PelosiWidget", () => {
  it("shows 10 rows out of the full 50-trade dataset once expanded", () => {
    render(<PelosiWidget revealed />);
    fireEvent.click(screen.getByTestId("widget-pelosi-header"));

    trades.slice(0, 10).forEach((t) => {
      expect(
        screen.getByTestId(`widget-pelosi-row-${t.ticker}-${t.date}`),
      ).toBeInTheDocument();
    });
    expect(
      screen.queryByTestId(`widget-pelosi-row-${trades[10].ticker}-${trades[10].date}`),
    ).not.toBeInTheDocument();
  });

  it("colors sell trades red and buy trades green", () => {
    render(<PelosiWidget revealed />);
    fireEvent.click(screen.getByTestId("widget-pelosi-header"));

    const visible = trades.slice(0, 10);
    const sellTrade = visible.find((t) => t.action === "sell")!;
    const buyTrade = visible.find((t) => t.action === "buy")!;

    expect(
      screen.getByTestId(`widget-pelosi-tag-${sellTrade.ticker}-${sellTrade.date}`),
    ).toHaveClass("bg-red");
    expect(
      screen.getByTestId(`widget-pelosi-tag-${buyTrade.ticker}-${buyTrade.date}`),
    ).toHaveClass("bg-green");
  });
});
