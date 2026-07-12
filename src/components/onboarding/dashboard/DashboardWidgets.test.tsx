import { act, render, screen } from "@testing-library/react";
import { DashboardWidgets } from "./DashboardWidgets";

function expectRevealed(
  testId: string,
  expected: boolean,
) {
  expect(screen.getByTestId(testId)).toHaveAttribute(
    "data-revealed",
    String(expected),
  );
}

describe("DashboardWidgets staggered reveal", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("reveals nothing immediately on mount", () => {
    render(<DashboardWidgets />);
    expectRevealed("calendar-wrap", false);
    expectRevealed("widget-pelosi", false);
    expectRevealed("widget-warsh", false);
    expectRevealed("widget-news", false);
  });

  it("reveals the calendar, then Pelosi, then Warsh, then News in a 500ms stagger starting at 7000ms", () => {
    render(<DashboardWidgets />);

    act(() => {
      jest.advanceTimersByTime(7000);
    });
    expectRevealed("calendar-wrap", true);
    expectRevealed("widget-pelosi", false);
    expectRevealed("widget-warsh", false);
    expectRevealed("widget-news", false);

    act(() => {
      jest.advanceTimersByTime(500);
    });
    expectRevealed("widget-pelosi", true);
    expectRevealed("widget-warsh", false);
    expectRevealed("widget-news", false);

    act(() => {
      jest.advanceTimersByTime(500);
    });
    expectRevealed("widget-warsh", true);
    expectRevealed("widget-news", false);

    act(() => {
      jest.advanceTimersByTime(500);
    });
    expectRevealed("widget-news", true);
  });

  it("clears its timers on unmount without throwing", () => {
    const { unmount } = render(<DashboardWidgets />);
    unmount();

    expect(() => {
      act(() => {
        jest.advanceTimersByTime(10000);
      });
    }).not.toThrow();
  });
});
