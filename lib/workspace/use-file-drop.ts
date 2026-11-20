/**
 * GigAI Workspace, window-level file drop guard.
 *
 * The problem it solves: a small dropzone tile only accepts drops inside its own
 * box. Drop a file a few pixels outside: on the preview, a sidebar, the page
 * body, and the browser's DEFAULT kicks in: it navigates the tab to the file
 * (`file:///…` / a blob view), which reads to the user as "drag-and-drop is
 * broken." The only robust fix is to handle drag/drop at the WINDOW level so the
 * entire page is a drop target and the browser default is always prevented.
 *
 * This hook attaches window listeners while mounted and:
 *   • prevents the browser default for FILE drags anywhere on the page (so a
 *     stray drop never navigates away),
 *   • routes the dropped files to `onFiles`,
 *   • exposes `isDragging` so the caller can show a full-cover "drop to add"
 *     overlay.
 *
 * It deliberately ignores NON-file drags (internal HTML5 drag-and-drop such as
 * reordering PDF page thumbnails): those carry no "Files" entry in
 * `dataTransfer.types`, so we leave their events untouched and their own
 * handlers run normally. No double handling, no broken internal DnD.
 */

"use client";

import { useEffect, useRef, useState } from "react";

/** True when a drag's payload contains OS files (not an internal element drag). */
function dragHasFiles(e: DragEvent): boolean {
  const dt = e.dataTransfer;
  if (!dt) return false;
  // `types` is a DOMStringList; OS file drags include the literal "Files".
  for (const t of Array.from(dt.types)) if (t === "Files") return true;
  return false;
}

export interface UseFileDropOptions {
  /** Disable the guard (e.g. while a blocking modal owns the page). */
  disabled?: boolean;
}

/**
 * @param onFiles Called with the dropped `File[]` (never empty). The latest
 *   callback each render is used, so it can close over fresh state safely.
 */
export function useFileDrop(
  onFiles: (files: File[]) => void,
  options: UseFileDropOptions = {},
): { isDragging: boolean } {
  const [isDragging, setIsDragging] = useState(false);
  // Nesting depth so child dragenter/dragleave pairs don't flicker the overlay.
  const depth = useRef(0);
  const onFilesRef = useRef(onFiles);
  onFilesRef.current = onFiles;
  const disabled = options.disabled ?? false;

  useEffect(() => {
    if (disabled) return;

    function onDragEnter(e: DragEvent) {
      if (!dragHasFiles(e)) return;
      e.preventDefault();
      depth.current += 1;
      setIsDragging(true);
    }
    function onDragOver(e: DragEvent) {
      if (!dragHasFiles(e)) return;
      // REQUIRED: without preventDefault on dragover the browser refuses the
      // drop and (on drop) navigates to the file instead.
      e.preventDefault();
      if (e.dataTransfer) e.dataTransfer.dropEffect = "copy";
    }
    function onDragLeave(e: DragEvent) {
      if (!dragHasFiles(e)) return;
      depth.current = Math.max(0, depth.current - 1);
      if (depth.current === 0) setIsDragging(false);
    }
    function onDrop(e: DragEvent) {
      const files = e.dataTransfer ? Array.from(e.dataTransfer.files) : [];
      depth.current = 0;
      setIsDragging(false);
      // Only claim FILE drops; let internal element DnD proceed untouched.
      if (files.length === 0) return;
      e.preventDefault();
      onFilesRef.current(files);
    }

    window.addEventListener("dragenter", onDragEnter);
    window.addEventListener("dragover", onDragOver);
    window.addEventListener("dragleave", onDragLeave);
    window.addEventListener("drop", onDrop);
    return () => {
      window.removeEventListener("dragenter", onDragEnter);
      window.removeEventListener("dragover", onDragOver);
      window.removeEventListener("dragleave", onDragLeave);
      window.removeEventListener("drop", onDrop);
      depth.current = 0;
    };
  }, [disabled]);

  return { isDragging };
}
