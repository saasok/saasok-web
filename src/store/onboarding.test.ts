import { useOnboardingStore, BROKERS, MAX_BROKERS } from "./onboarding";

beforeEach(() => {
  useOnboardingStore.getState().reset();
});

describe("brokers", () => {
  it("adds brokers up to the cap", () => {
    const { toggleBroker } = useOnboardingStore.getState();
    toggleBroker(BROKERS[0]);
    toggleBroker(BROKERS[1]);
    toggleBroker(BROKERS[2]);
    expect(useOnboardingStore.getState().brokers).toHaveLength(MAX_BROKERS);
  });

  it("rejects a 4th broker selection", () => {
    const { toggleBroker } = useOnboardingStore.getState();
    toggleBroker(BROKERS[0]);
    toggleBroker(BROKERS[1]);
    toggleBroker(BROKERS[2]);
    toggleBroker(BROKERS[3]);
    const { brokers } = useOnboardingStore.getState();
    expect(brokers).toHaveLength(MAX_BROKERS);
    expect(brokers).not.toContain(BROKERS[3]);
  });

  it("deselects an already-selected broker", () => {
    const { toggleBroker } = useOnboardingStore.getState();
    toggleBroker(BROKERS[0]);
    toggleBroker(BROKERS[0]);
    expect(useOnboardingStore.getState().brokers).toHaveLength(0);
  });

  it("starts with zero brokers selected", () => {
    expect(useOnboardingStore.getState().brokers).toHaveLength(0);
  });
});

describe("risk", () => {
  it("is single-select and overwrites the previous choice", () => {
    const { setRisk } = useOnboardingStore.getState();
    setRisk("conservative");
    setRisk("aggressive");
    expect(useOnboardingStore.getState().risk).toBe("aggressive");
  });
});

describe("years", () => {
  it("is single-select and overwrites the previous choice", () => {
    const { setYears } = useOnboardingStore.getState();
    setYears("1-4");
    setYears("10+");
    expect(useOnboardingStore.getState().years).toBe("10+");
  });
});

describe("page navigation guard", () => {
  it("advances forward through pages", () => {
    useOnboardingStore.getState().goTo("page2");
    expect(useOnboardingStore.getState().page).toBe("page2");
    useOnboardingStore.getState().goTo("page3");
    expect(useOnboardingStore.getState().page).toBe("page3");
  });

  it("blocks backward navigation once a later page has been reached", () => {
    useOnboardingStore.getState().goTo("page2");
    useOnboardingStore.getState().goTo("page4");
    useOnboardingStore.getState().goTo("page2");
    expect(useOnboardingStore.getState().page).toBe("page4");
  });

  it("blocks re-navigating to the same page from re-triggering forward state incorrectly", () => {
    useOnboardingStore.getState().goTo("page3");
    useOnboardingStore.getState().goTo("page3");
    expect(useOnboardingStore.getState().page).toBe("page3");
  });

  it("reset returns to page1 and clears the forward guard", () => {
    useOnboardingStore.getState().goTo("page3");
    useOnboardingStore.getState().reset();
    expect(useOnboardingStore.getState().page).toBe("page1");
    useOnboardingStore.getState().goTo("page2");
    expect(useOnboardingStore.getState().page).toBe("page2");
  });
});
