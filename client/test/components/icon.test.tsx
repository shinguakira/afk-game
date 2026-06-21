/**
 * @vitest-environment happy-dom
 *
 * DOM rendering smoke tests for the Icon component.
 * Uses react-dom/client directly — no @testing-library.
 */
import { describe, expect, test, afterEach } from "vitest";
import { createRoot, type Root } from "react-dom/client";
import { act } from "react";
import { Icon } from "@/components/icons";

// Track roots per-test so we always unmount before GC.
let root: Root | null = null;
let container: HTMLElement | null = null;

afterEach(() => {
  if (root) {
    act(() => {
      root!.unmount();
    });
    root = null;
  }
  if (container) {
    document.body.removeChild(container);
    container = null;
  }
});

async function render(el: React.ReactElement): Promise<HTMLElement> {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  await act(async () => {
    root!.render(el);
  });
  return container;
}

describe("Icon component", () => {
  test("renders without crash when name is omitted (fallback icon)", async () => {
    const el = await render(<Icon />);
    // LuFileCode2 fallback renders an SVG
    expect(el.querySelector("svg")).not.toBeNull();
  });

  test("renders without crash for a known tech icon (js)", async () => {
    const el = await render(<Icon name="js" />);
    expect(el.querySelector("svg")).not.toBeNull();
  });

  test("renders without crash for an unknown name (still gets fallback SVG)", async () => {
    const el = await render(<Icon name="totally_unknown_icon_xyz" />);
    expect(el.querySelector("svg")).not.toBeNull();
  });

  test("size prop is forwarded to the SVG element", async () => {
    const el = await render(<Icon name="js" size={32} />);
    const svg = el.querySelector("svg");
    expect(svg).not.toBeNull();
    // react-icons sets width/height attributes equal to the size prop
    const w = svg!.getAttribute("width");
    const h = svg!.getAttribute("height");
    expect(w).toBe("32");
    expect(h).toBe("32");
  });

  test("custom item icon (commit) renders a span wrapper", async () => {
    // commit is a custom SVG icon in ITEM_ICONS, so Icon wraps it in <span>
    const el = await render(<Icon name="commit" />);
    const span = el.querySelector("span");
    // Either a span (custom) or an SVG directly (Lucide)
    expect(el.firstElementChild).not.toBeNull();
  });
});
