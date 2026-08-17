let activePreview: HTMLElement | null = null;

export function attachWorkbenchDragPreview(
  event: { dataTransfer: { setDragImage: (image: Element, x: number, y: number) => void } | null },
  copy: { title: string; subtitle: string },
) {
  const transfer = event.dataTransfer;
  if (!transfer) return;
  releaseWorkbenchDragPreview();
  const preview = document.createElement("div");
  preview.className = "workbench-drag-preview";
  preview.setAttribute("aria-hidden", "true");
  const title = document.createElement("strong");
  title.textContent = copy.title;
  preview.append(title);
  if (copy.subtitle) {
    const subtitle = document.createElement("span");
    subtitle.textContent = copy.subtitle;
    preview.append(subtitle);
  }
  document.body.append(preview);
  transfer.setDragImage(preview, 16, 16);
  activePreview = preview;
}

export function releaseWorkbenchDragPreview() {
  activePreview?.remove();
  activePreview = null;
}
