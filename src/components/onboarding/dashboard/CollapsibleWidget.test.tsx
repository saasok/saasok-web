import { fireEvent, screen } from "@testing-library/react";
import { renderWithIntl } from "@/test/renderWithIntl";
import { CollapsibleWidget } from "./CollapsibleWidget";

function renderWidget(totalRows = 50) {
  return renderWithIntl(
    <CollapsibleWidget
      testId="widget-test"
      title="Test Widget"
      positionClassName="left-0 bottom-0 w-[280px]"
      revealed
      totalRows={totalRows}
      scrollHintLabel="scroll for more"
      renderRow={(index) => <span>row-{index}</span>}
    />,
  );
}

describe("CollapsibleWidget", () => {
  it("is collapsed by default", () => {
    renderWidget();
    expect(screen.getByTestId("widget-test")).toHaveAttribute(
      "data-open",
      "false",
    );
    expect(screen.queryByTestId("widget-test-body")).not.toBeInTheDocument();
  });

  it("toggles open and closed on header click", () => {
    renderWidget();
    const header = screen.getByTestId("widget-test-header");

    fireEvent.click(header);
    expect(screen.getByTestId("widget-test")).toHaveAttribute(
      "data-open",
      "true",
    );
    expect(screen.getByTestId("widget-test-body")).toBeInTheDocument();

    fireEvent.click(header);
    expect(screen.getByTestId("widget-test")).toHaveAttribute(
      "data-open",
      "false",
    );
    expect(screen.queryByTestId("widget-test-body")).not.toBeInTheDocument();
  });

  it("force-closes without re-opening when the wclose span is clicked", () => {
    renderWidget();
    const header = screen.getByTestId("widget-test-header");

    fireEvent.click(header);
    expect(screen.getByTestId("widget-test")).toHaveAttribute(
      "data-open",
      "true",
    );

    fireEvent.click(screen.getByTestId("widget-test-close"));
    expect(screen.getByTestId("widget-test")).toHaveAttribute(
      "data-open",
      "false",
    );

    fireEvent.click(screen.getByTestId("widget-test-close"));
    expect(screen.getByTestId("widget-test")).toHaveAttribute(
      "data-open",
      "false",
    );
  });

  it("shows a 10-row window starting at row 0 and reveals row 10 (the 11th row) after one down-step", () => {
    renderWidget();
    fireEvent.click(screen.getByTestId("widget-test-header"));

    expect(screen.getByTestId("widget-test-row-0")).toBeInTheDocument();
    expect(screen.getByTestId("widget-test-row-9")).toBeInTheDocument();
    expect(screen.queryByTestId("widget-test-row-10")).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId("widget-test-scroll-down"));

    expect(screen.queryByTestId("widget-test-row-0")).not.toBeInTheDocument();
    expect(screen.getByTestId("widget-test-row-10")).toBeInTheDocument();
  });

  it("tracks a widget_scroll event with the widget id and scroll depth on step", () => {
    window.gtag = jest.fn();
    renderWidget(50);
    fireEvent.click(screen.getByTestId("widget-test-header"));

    fireEvent.click(screen.getByTestId("widget-test-scroll-down"));

    // totalRows 50, windowSize 10 -> maxStart 40; stepping from 0 to 1.
    expect(window.gtag).toHaveBeenCalledWith("event", "widget_scroll", {
      widget: "widget-test",
      depth_pct: 3,
    });

    delete window.gtag;
  });

  it("does not track a scroll event when a step is a no-op at a boundary", () => {
    window.gtag = jest.fn();
    renderWidget();
    fireEvent.click(screen.getByTestId("widget-test-header"));

    fireEvent.click(screen.getByTestId("widget-test-scroll-up"));

    expect(window.gtag).not.toHaveBeenCalled();

    delete window.gtag;
  });

  it("cannot scroll above the first row via wheel or the up arrow", () => {
    renderWidget();
    fireEvent.click(screen.getByTestId("widget-test-header"));
    const body = screen.getByTestId("widget-test-body");

    for (let i = 0; i < 5; i++) {
      fireEvent.wheel(body, { deltaY: -100 });
    }
    fireEvent.click(screen.getByTestId("widget-test-scroll-up"));

    expect(screen.getByTestId("widget-test-row-0")).toBeInTheDocument();
  });

  it("cannot scroll past the last row via wheel or the down arrow", () => {
    renderWidget(50);
    fireEvent.click(screen.getByTestId("widget-test-header"));
    const body = screen.getByTestId("widget-test-body");

    for (let i = 0; i < 60; i++) {
      fireEvent.wheel(body, { deltaY: 100 });
    }

    expect(screen.getByTestId("widget-test-row-49")).toBeInTheDocument();
    expect(screen.queryByTestId("widget-test-row-50")).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId("widget-test-scroll-down"));
    expect(screen.getByTestId("widget-test-row-49")).toBeInTheDocument();
  });
});
