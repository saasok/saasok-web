import { render, screen } from "@testing-library/react";
import Home from "@/app/page";

describe("root page", () => {
  it("renders without throwing", () => {
    render(<Home />);
    expect(screen.getByText(/SaaSok/i)).toBeInTheDocument();
  });
});
