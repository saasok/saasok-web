import { fireEvent, screen } from "@testing-library/react";
import { renderWithIntl } from "@/test/renderWithIntl";
import { WarshWidget } from "./WarshWidget";
import warshData from "../../../../data/warsh-speeches.json";

const talks = warshData.talks;

describe("WarshWidget", () => {
  it("shows 10 rows out of the full speech list once expanded", () => {
    renderWithIntl(<WarshWidget revealed />);
    fireEvent.click(screen.getByTestId("widget-warsh-header"));

    talks.slice(0, 10).forEach((t) => {
      expect(screen.getByTestId(`widget-warsh-row-${t.date}`)).toBeInTheDocument();
    });
    expect(
      screen.queryByTestId(`widget-warsh-row-${talks[10].date}`),
    ).not.toBeInTheDocument();
  });

  it("exposes date, topic, and location as distinct nodes per row (3-column look)", () => {
    renderWithIntl(<WarshWidget revealed />);
    fireEvent.click(screen.getByTestId("widget-warsh-header"));

    const first = talks[0];
    expect(screen.getByTestId(`widget-warsh-date-${first.date}`)).toHaveTextContent(
      first.date,
    );
    expect(screen.getByTestId(`widget-warsh-topic-${first.date}`)).toHaveTextContent(
      first.topic,
    );
    expect(
      screen.getByTestId(`widget-warsh-location-${first.date}`),
    ).toHaveTextContent(first.location);
  });

  it("every speech is dated on or after today (2026-07-12)", () => {
    talks.forEach((t) => {
      expect(t.date >= "2026-07-12").toBe(true);
    });
  });
});
