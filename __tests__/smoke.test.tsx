import { screen } from "@testing-library/react";
import { renderWithIntl } from "@/test/renderWithIntl";
import Home from "@/app/page";

describe("root page", () => {
  it("renders without throwing", () => {
    renderWithIntl(<Home />);
    expect(screen.getByText(/SaaSok/i)).toBeInTheDocument();
  });
});
