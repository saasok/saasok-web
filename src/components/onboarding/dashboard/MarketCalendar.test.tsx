import { fireEvent, render, screen } from "@testing-library/react";
import { MarketCalendar } from "./MarketCalendar";

describe("MarketCalendar", () => {
  it("opens a panel on hover and closes it on mouse-out when not picked", () => {
    render(<MarketCalendar revealed />);
    const nyse = screen.getByTestId("exchange-NYSE");

    fireEvent.mouseEnter(nyse);
    expect(screen.getByTestId("exchange-panel-NYSE")).toHaveAttribute(
      "data-open",
      "true",
    );

    fireEvent.mouseLeave(nyse);
    expect(screen.getByTestId("exchange-panel-NYSE")).toHaveAttribute(
      "data-open",
      "false",
    );
  });

  it("keeps the panel open after mouse-out once clicked (picked)", () => {
    render(<MarketCalendar revealed />);
    const nyse = screen.getByTestId("exchange-NYSE");

    fireEvent.mouseEnter(nyse);
    fireEvent.click(nyse);
    fireEvent.mouseLeave(nyse);

    expect(screen.getByTestId("exchange-NYSE")).toHaveAttribute(
      "data-picked",
      "true",
    );
    expect(screen.getByTestId("exchange-panel-NYSE")).toHaveAttribute(
      "data-open",
      "true",
    );
  });

  it("supports multi-select: a picked exchange stays open while another opens only on hover", () => {
    render(<MarketCalendar revealed />);
    const nyse = screen.getByTestId("exchange-NYSE");
    const nasdaq = screen.getByTestId("exchange-NASDAQ");

    fireEvent.click(nyse);
    fireEvent.mouseEnter(nasdaq);

    expect(screen.getByTestId("exchange-panel-NYSE")).toHaveAttribute(
      "data-open",
      "true",
    );
    expect(screen.getByTestId("exchange-panel-NASDAQ")).toHaveAttribute(
      "data-open",
      "true",
    );

    fireEvent.mouseLeave(nasdaq);
    expect(screen.getByTestId("exchange-panel-NYSE")).toHaveAttribute(
      "data-open",
      "true",
    );
    expect(screen.getByTestId("exchange-panel-NASDAQ")).toHaveAttribute(
      "data-open",
      "false",
    );
  });

  it("the clear-all button only appears once something is picked, and resets everything", () => {
    render(<MarketCalendar revealed />);
    expect(screen.queryByTestId("calendar-clear")).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId("exchange-NYSE"));
    fireEvent.click(screen.getByTestId("exchange-LSE"));
    expect(screen.getByTestId("calendar-clear")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("calendar-clear"));

    expect(screen.queryByTestId("calendar-clear")).not.toBeInTheDocument();
    expect(screen.getByTestId("exchange-NYSE")).toHaveAttribute(
      "data-picked",
      "false",
    );
    expect(screen.getByTestId("exchange-panel-NYSE")).toHaveAttribute(
      "data-open",
      "false",
    );
    expect(screen.getByTestId("exchange-panel-LSE")).toHaveAttribute(
      "data-open",
      "false",
    );
  });
});
