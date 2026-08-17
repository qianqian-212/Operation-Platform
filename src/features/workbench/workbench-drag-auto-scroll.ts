const TOP_ZONE = 16;
const BOTTOM_ZONE = 80;
const MIN_SPEED = 6;
const MAX_SPEED = 22;

export interface WorkbenchDragScrollViewport {
  pointerY: number;
  scrollerTop: number;
  scrollerBottom: number;
  coveredTop: number;
}

export interface WorkbenchDragSession {
  stop: () => void;
}

export function workbenchDragScrollDelta(viewport: WorkbenchDragScrollViewport): number {
  const topHotEnd = viewport.scrollerTop + viewport.coveredTop + TOP_ZONE;
  if (viewport.pointerY <= topHotEnd) {
    const range = Math.max(1, topHotEnd - viewport.scrollerTop);
    return -scrollSpeed((topHotEnd - viewport.pointerY) / range);
  }
  const bottomHotStart = viewport.scrollerBottom - BOTTOM_ZONE;
  if (viewport.pointerY >= bottomHotStart) {
    const range = Math.max(1, viewport.scrollerBottom - bottomHotStart);
    return scrollSpeed((viewport.pointerY - bottomHotStart) / range);
  }
  return 0;
}

export function findWorkbenchScrollParent(start: HTMLElement | null): HTMLElement | null {
  let current = start?.parentElement ?? null;
  while (current) {
    const overflowY = getComputedStyle(current).overflowY;
    const canScroll = overflowY === "auto" || overflowY === "scroll";
    if (canScroll && current.scrollHeight > current.clientHeight + 1) return current;
    current = current.parentElement;
  }
  return null;
}

export function beginWorkbenchDragSession(options: {
  origin: HTMLElement;
  onPointer?: (event: DragEvent) => void;
}): WorkbenchDragSession {
  const scroller = findWorkbenchScrollParent(options.origin);
  const page = options.origin.closest(".workbench-page");
  page?.classList.add("is-dragging-widget");
  let pointerY: number | null = null;
  let frame = 0;
  let stopped = false;

  function onDragOver(event: DragEvent) {
    event.preventDefault();
    pointerY = event.clientY;
    options.onPointer?.(event);
  }

  function tick() {
    if (stopped) return;
    if (scroller && pointerY !== null) scrollScroller(scroller, page, pointerY);
    frame = requestAnimationFrame(tick);
  }

  document.addEventListener("dragover", onDragOver, true);
  frame = requestAnimationFrame(tick);
  return {
    stop() {
      if (stopped) return;
      stopped = true;
      cancelAnimationFrame(frame);
      document.removeEventListener("dragover", onDragOver, true);
      page?.classList.remove("is-dragging-widget");
    },
  };
}

function scrollSpeed(depth: number): number {
  const t = Math.min(1, Math.max(0, depth));
  return Math.ceil(MIN_SPEED + (MAX_SPEED - MIN_SPEED) * t);
}

function scrollScroller(scroller: HTMLElement, page: Element | null, pointerY: number) {
  const rect = scroller.getBoundingClientRect();
  const toolbar = page?.querySelector(".editor-toolbar");
  const toolbarBottom = toolbar instanceof HTMLElement
    ? toolbar.getBoundingClientRect().bottom
    : rect.top;
  scroller.scrollTop += workbenchDragScrollDelta({
    pointerY,
    scrollerTop: rect.top,
    scrollerBottom: rect.bottom,
    coveredTop: Math.max(0, toolbarBottom - rect.top),
  });
}
