import { act } from "react";
import { screen, fireEvent } from "@testing-library/react";
import { renderWithIntl } from "@/test/renderWithIntl";
import { ClosingPage } from "./ClosingPage";

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

describe("staged reveal", () => {
  it("fades in the thanks line at 900ms and the restart button at 2600ms", () => {
    renderWithIntl(<ClosingPage onRestart={jest.fn()} />);

    expect(screen.getByTestId("closing-thanks")).toHaveClass("opacity-0");
    expect(screen.getByTestId("closing-restart")).toHaveClass("opacity-0");

    act(() => {
      jest.advanceTimersByTime(900);
    });
    expect(screen.getByTestId("closing-thanks")).toHaveClass("opacity-100");
    expect(screen.getByTestId("closing-restart")).toHaveClass("opacity-0");

    act(() => {
      jest.advanceTimersByTime(1700);
    });
    expect(screen.getByTestId("closing-restart")).toHaveClass("opacity-100");
  });
});

describe("restart flow", () => {
  it("collapses before calling onRestart, rather than resetting immediately", () => {
    const onRestart = jest.fn();
    renderWithIntl(<ClosingPage onRestart={onRestart} />);

    fireEvent.click(screen.getByTestId("closing-restart"));
    expect(screen.getByTestId("closing-wrap")).toHaveClass("opacity-0");
    expect(onRestart).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(900);
    });
    expect(onRestart).toHaveBeenCalledTimes(1);
  });
});
