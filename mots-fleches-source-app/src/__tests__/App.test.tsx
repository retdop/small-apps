// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import App from "../App";

// Minimal browser-API stubs not provided by jsdom
function makeGainNode() {
  return {
    connect: vi.fn(),
    gain: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
  };
}
function makeOscillator() {
  return {
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
    type: "sine" as OscillatorType,
    frequency: { value: 0 },
  };
}

beforeEach(() => {
  vi.stubGlobal(
    "AudioContext",
    vi.fn().mockImplementation(() => ({
      createOscillator: vi.fn(makeOscillator),
      createGain: vi.fn(makeGainNode),
      currentTime: 0,
      state: "running",
      resume: vi.fn().mockResolvedValue(undefined),
      destination: {},
    }))
  );
  Object.defineProperty(navigator, "vibrate", {
    configurable: true,
    value: vi.fn(),
  });
  localStorage.clear();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("App — smoke tests", () => {
  it("renders without throwing (catches TDZ / init crashes)", async () => {
    render(<App />);
    // findByText waits for async init to complete; a TDZ crash would throw before this
    expect(await screen.findByText("Cruciverbiste")).toBeInTheDocument();
  });

  it("shows the app title after loading", async () => {
    render(<App />);
    expect(await screen.findByText("Cruciverbiste")).toBeInTheDocument();
  });

  it("renders session-length pills", async () => {
    render(<App />);
    await screen.findByText("Cruciverbiste");
    expect(screen.getByText("Tout")).toBeInTheDocument();
    expect(screen.getByText("10 mots")).toBeInTheDocument();
    expect(screen.getByText("25 mots")).toBeInTheDocument();
  });

  it("renders QCM toggle", async () => {
    render(<App />);
    await screen.findByText("Cruciverbiste");
    expect(screen.getByText("QCM")).toBeInTheDocument();
  });

  it("renders the sound toggle button", async () => {
    render(<App />);
    await screen.findByText("Cruciverbiste");
    // Sound toggle is an icon button — verify it exists in the header area
    const header = document.querySelector("header");
    expect(header).not.toBeNull();
    expect(header!.querySelector("button")).toBeInTheDocument();
  });

  it("shows a question card after loading", async () => {
    render(<App />);
    await screen.findByText("Cruciverbiste");
    // A card should be visible with at least one word-count hint
    expect(screen.getByText(/lettre/)).toBeInTheDocument();
  });
});
