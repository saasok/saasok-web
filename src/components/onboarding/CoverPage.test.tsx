import { act, screen, fireEvent } from "@testing-library/react";
import { LANGUAGES, useOnboardingStore } from "@/store/onboarding";
import { renderWithIntl } from "@/test/renderWithIntl";
import { CoverPage } from "./CoverPage";
import enMessages from "@/messages/en.json";
import deMessages from "@/messages/de.json";
import frMessages from "@/messages/fr.json";
import itMessages from "@/messages/it.json";

const MESSAGES_BY_LOCALE = {
  en: enMessages,
  de: deMessages,
  fr: frMessages,
  it: itMessages,
} as const;

async function flushMicrotasks() {
  for (let i = 0; i < 6; i++) {
    await Promise.resolve();
  }
}

describe("CoverPage geo/VPN gate", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    jest.useFakeTimers();
    useOnboardingStore.getState().reset();
  });

  afterEach(() => {
    jest.useRealTimers();
    global.fetch = originalFetch;
  });

  it("shows the language gate and advances via language selection when a VPN is detected", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ country: "Germany", isVpn: true }),
    }) as unknown as typeof fetch;

    renderWithIntl(<CoverPage />);

    await act(async () => {
      await flushMicrotasks();
    });

    expect(screen.getByTestId("language-gate")).toBeInTheDocument();

    // The pending 3800ms auto-advance must have been cancelled by the gate.
    act(() => {
      jest.advanceTimersByTime(4000);
    });
    expect(useOnboardingStore.getState().page).toBe("page1");

    fireEvent.click(screen.getByTestId("language-de"));
    expect(useOnboardingStore.getState().language).toBe("de");
    expect(useOnboardingStore.getState().page).toBe("page2");
  });

  it("skips the gate and auto-advances at 3800ms when no VPN is detected", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ country: "United States", isVpn: false }),
    }) as unknown as typeof fetch;

    renderWithIntl(<CoverPage />);

    await act(async () => {
      await flushMicrotasks();
    });

    expect(screen.queryByTestId("language-gate")).not.toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(3800);
    });
    expect(useOnboardingStore.getState().page).toBe("page2");
    expect(useOnboardingStore.getState().language).toBe("en");
  });

  it("fails open — no gate, normal advance — when the geo fetch errors", async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error("network down"));

    renderWithIntl(<CoverPage />);

    await act(async () => {
      await flushMicrotasks();
    });

    expect(screen.queryByTestId("language-gate")).not.toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(3800);
    });
    expect(useOnboardingStore.getState().page).toBe("page2");
  });

  it("does not advance before 3800ms even without a VPN", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ country: null, isVpn: false }),
    }) as unknown as typeof fetch;

    renderWithIntl(<CoverPage />);

    await act(async () => {
      await flushMicrotasks();
    });

    act(() => {
      jest.advanceTimersByTime(3799);
    });
    expect(useOnboardingStore.getState().page).toBe("page1");
  });
});

describe("CoverPage locale rendering", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    useOnboardingStore.getState().reset();
    global.fetch = jest
      .fn()
      .mockResolvedValue({
        ok: true,
        json: async () => ({ country: null, isVpn: false }),
      }) as unknown as typeof fetch;
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it.each(LANGUAGES.map((l) => l.code))(
    "renders the cover tagline in %s",
    (code) => {
      useOnboardingStore.setState({ language: code });
      renderWithIntl(<CoverPage />);

      expect(screen.getByTestId("cover-tagline").textContent).toContain(
        MESSAGES_BY_LOCALE[code].cover.taglinePrefix,
      );
    },
  );
});

describe("LanguageGate locale rendering", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    useOnboardingStore.getState().reset();
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ country: "Germany", isVpn: true }),
    }) as unknown as typeof fetch;
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it.each(LANGUAGES.map((l) => l.code))(
    "renders the language-gate prompt in %s once the gate appears",
    async (code) => {
      useOnboardingStore.setState({ language: code });
      renderWithIntl(<CoverPage />);

      await act(async () => {
        for (let i = 0; i < 6; i++) await Promise.resolve();
      });

      expect(screen.getByTestId("language-gate").textContent).toContain(
        MESSAGES_BY_LOCALE[code].languageGate.prompt,
      );
    },
  );
});
