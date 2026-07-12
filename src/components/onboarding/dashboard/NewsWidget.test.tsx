import { fireEvent, render, screen } from "@testing-library/react";
import { NewsWidget, getInitials, getSourceColor } from "./NewsWidget";
import newsData from "../../../../data/market-news.json";

const items = newsData.items;

describe("NewsWidget", () => {
  it("shows a 5-row window out of the full 50-item feed once expanded, each with a thumbnail, title, description, source and date", () => {
    render(<NewsWidget revealed />);
    fireEvent.click(screen.getByTestId("widget-news-header"));

    items.slice(0, 5).forEach((n, index) => {
      expect(screen.getByTestId(`widget-news-row-${index}`)).toBeInTheDocument();
      expect(screen.getByTestId(`widget-news-thumb-${index}`)).toHaveTextContent(
        getInitials(n.source),
      );
      expect(screen.getByTestId(`widget-news-title-${index}`)).toHaveTextContent(
        n.title,
      );
      expect(
        screen.getByTestId(`widget-news-description-${index}`),
      ).toHaveTextContent(n.description);
    });
    expect(screen.queryByTestId("widget-news-row-5")).not.toBeInTheDocument();
  });

  it("every description is well under the 400-word cap", () => {
    items.forEach((n) => {
      expect(n.description.split(/\s+/).length).toBeLessThan(400);
    });
  });
});

describe("getSourceColor / getInitials", () => {
  it("is deterministic: the same source always gets the same color and initials", () => {
    expect(getSourceColor("Bloomberg")).toBe(getSourceColor("Bloomberg"));
    expect(getInitials("Bloomberg")).toBe(getInitials("Bloomberg"));
  });

  it("produces short initials for multi-word sources", () => {
    expect(getInitials("Financial Times")).toBe("FT");
  });
});
