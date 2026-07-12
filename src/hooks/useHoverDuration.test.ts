import { act, renderHook } from "@testing-library/react";
import { useHoverDuration } from "./useHoverDuration";

describe("useHoverDuration", () => {
  it("tracks a widget_hover event with the elapsed duration on mouse-out", () => {
    const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    const nowSpy = jest.spyOn(Date, "now");
    nowSpy.mockReturnValueOnce(1_000).mockReturnValueOnce(3_500);

    const { result } = renderHook(() => useHoverDuration("widget-pelosi"));

    act(() => result.current.onMouseEnter());
    act(() => result.current.onMouseLeave());

    expect(logSpy).toHaveBeenCalledTimes(1);
    expect(logSpy).toHaveBeenCalledWith("[analytics]", "widget_hover", {
      widget: "widget-pelosi",
      duration_seconds: 2.5,
    });

    logSpy.mockRestore();
    nowSpy.mockRestore();
  });

  it("does not fire on mouse-enter alone or on a leave without a prior enter", () => {
    const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});

    const { result } = renderHook(() => useHoverDuration("widget-warsh"));

    act(() => result.current.onMouseEnter());
    expect(logSpy).not.toHaveBeenCalled();

    act(() => result.current.onMouseLeave());
    expect(logSpy).toHaveBeenCalledTimes(1);

    act(() => result.current.onMouseLeave());
    expect(logSpy).toHaveBeenCalledTimes(1);

    logSpy.mockRestore();
  });
});
