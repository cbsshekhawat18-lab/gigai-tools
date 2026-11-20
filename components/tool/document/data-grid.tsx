"use client";

/**
 * <DataGrid>, a fast, spreadsheet-like table for CSV / Excel data.
 *
 * The CSV / Excel workhorse of the document toolkit. Renders a `TableData`
 * (headers + string rows) with a sticky header, per-cell editing, add/delete of
 * rows and columns, click-to-sort, and paste-from-clipboard that expands the
 * grid to fit multi-cell TSV pastes. Large tables are windowed (only visible
 * rows are mounted) so tens of thousands of rows stay smooth; a soft cap with a
 * notice guards truly pathological inputs.
 *
 * Fully controlled: pass `data` and `onChange`. Read-only mode drops all the
 * editing chrome and just displays the grid.
 */

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import {
  type TableData,
  normalizeTable,
} from "@/lib/document-tools";

/** Sort direction for a column. */
type SortDir = "asc" | "desc";

/** Props for {@link DataGrid}. */
export interface DataGridProps {
  /** The table to render (headers + rows). Normalised internally. */
  data: TableData;
  /** Emitted with a new table on any edit. Omit / set `editable={false}` for read-only. */
  onChange?: (next: TableData) => void;
  /** Enable cell editing and add/delete controls. Default true. */
  editable?: boolean;
  /** Allow click-to-sort on headers. Default true. */
  sortable?: boolean;
  /** Max rows to keep in state; extras are dropped with a notice. Default 50000. */
  maxRows?: number;
  /** Approx. viewport height in px for the scroll area. Default 440. */
  height?: number;
  /** Show the 1-based row-number gutter. Default true. */
  showRowNumbers?: boolean;
  className?: string;
  /** Message shown when there are zero rows. */
  emptyLabel?: React.ReactNode;
}

const ROW_HEIGHT = 34; // px, must match the cell height styling below
const OVERSCAN = 6;

/** A fast, windowed, editable spreadsheet grid over `TableData`. */
export function DataGrid({
  data,
  onChange,
  editable = true,
  sortable = true,
  maxRows = 50000,
  height = 440,
  showRowNumbers = true,
  className,
  emptyLabel = "No rows yet",
}: DataGridProps) {
  const table = React.useMemo(() => normalizeTable(data), [data]);
  const canEdit = editable && !!onChange;

  const [sort, setSort] = React.useState<{ col: number; dir: SortDir } | null>(
    null,
  );
  const [editing, setEditing] = React.useState<{ row: number; col: number } | null>(
    null,
  );
  const [scrollTop, setScrollTop] = React.useState(0);
  const scrollerRef = React.useRef<HTMLDivElement>(null);

  const capped = table.rows.length > maxRows;
  const rows = capped ? table.rows.slice(0, maxRows) : table.rows;

  // Sorting produces a *view* order without mutating the underlying row array,
  // so edits still map back to the true index via `displayOrder`.
  const displayOrder = React.useMemo(() => {
    const order = rows.map((_, i) => i);
    if (!sort) return order;
    const { col, dir } = sort;
    const factor = dir === "asc" ? 1 : -1;
    order.sort((a, b) => {
      const av = rows[a]?.[col] ?? "";
      const bv = rows[b]?.[col] ?? "";
      const an = Number(av);
      const bn = Number(bv);
      const numeric =
        av !== "" && bv !== "" && !Number.isNaN(an) && !Number.isNaN(bn);
      if (numeric) return (an - bn) * factor;
      return av.localeCompare(bv) * factor;
    });
    return order;
  }, [rows, sort]);

  const emit = React.useCallback(
    (next: TableData) => onChange?.(normalizeTable(next)),
    [onChange],
  );

  /* ── Mutations ──────────────────────────────────────────────────────────── */

  const setCell = (rowIdx: number, colIdx: number, value: string) => {
    const nextRows = table.rows.map((r, i) =>
      i === rowIdx ? r.map((c, j) => (j === colIdx ? value : c)) : r,
    );
    emit({ headers: table.headers, rows: nextRows });
  };

  const setHeader = (colIdx: number, value: string) => {
    const headers = table.headers.map((h, j) => (j === colIdx ? value : h));
    emit({ headers, rows: table.rows });
  };

  const addRow = () => {
    if (table.rows.length >= maxRows) return;
    const blank = table.headers.map(() => "");
    emit({ headers: table.headers, rows: [...table.rows, blank] });
  };

  const deleteRow = (rowIdx: number) => {
    emit({
      headers: table.headers,
      rows: table.rows.filter((_, i) => i !== rowIdx),
    });
  };

  const addColumn = () => {
    emit({
      headers: [...table.headers, `Column ${table.headers.length + 1}`],
      rows: table.rows.map((r) => [...r, ""]),
    });
  };

  const deleteColumn = (colIdx: number) => {
    if (table.headers.length <= 1) return;
    emit({
      headers: table.headers.filter((_, j) => j !== colIdx),
      rows: table.rows.map((r) => r.filter((_, j) => j !== colIdx)),
    });
    setSort((s) => (s && s.col === colIdx ? null : s));
  };

  /**
   * Paste a clipboard block starting at (rowIdx, colIdx). TSV/CSV is split into
   * a matrix; the grid grows in both dimensions to fit it.
   */
  const pasteAt = (rowIdx: number, colIdx: number, text: string) => {
    const matrix = text
      .replace(/\r\n?/g, "\n")
      .replace(/\n$/, "")
      .split("\n")
      .map((line) => line.split("\t"));
    if (matrix.length === 0) return;

    const neededCols = colIdx + Math.max(...matrix.map((r) => r.length));
    const headers =
      neededCols > table.headers.length
        ? [
            ...table.headers,
            ...Array.from(
              { length: neededCols - table.headers.length },
              (_, i) => `Column ${table.headers.length + i + 1}`,
            ),
          ]
        : table.headers;

    const rowsCopy = table.rows.map((r) => [...r]);
    for (let r = 0; r < matrix.length; r += 1) {
      const targetRow = rowIdx + r;
      while (rowsCopy.length <= targetRow && rowsCopy.length < maxRows) {
        rowsCopy.push(headers.map(() => ""));
      }
      const dest = rowsCopy[targetRow];
      if (!dest) break;
      const src = matrix[r] ?? [];
      for (let c = 0; c < src.length; c += 1) {
        dest[colIdx + c] = src[c] ?? "";
      }
    }
    emit({ headers, rows: rowsCopy });
  };

  const toggleSort = (colIdx: number) => {
    if (!sortable) return;
    setSort((s) => {
      if (!s || s.col !== colIdx) return { col: colIdx, dir: "asc" };
      if (s.dir === "asc") return { col: colIdx, dir: "desc" };
      return null;
    });
  };

  /* ── Windowing ──────────────────────────────────────────────────────────── */

  const total = displayOrder.length;
  const viewport = height - ROW_HEIGHT; // minus sticky header
  const first = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - OVERSCAN);
  const visibleCount = Math.ceil(viewport / ROW_HEIGHT) + OVERSCAN * 2;
  const last = Math.min(total, first + visibleCount);
  const padTop = first * ROW_HEIGHT;
  const padBottom = (total - last) * ROW_HEIGHT;

  const colCount = table.headers.length;

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {/* Toolbar */}
      {canEdit && (
        <div className="flex flex-wrap items-center gap-2">
          <GridButton icon="Plus" label="Add row" onClick={addRow} />
          <GridButton icon="Columns3" label="Add column" onClick={addColumn} />
          <span className="ml-auto text-sm text-muted-foreground tabular-nums">
            {table.rows.length.toLocaleString()} row
            {table.rows.length === 1 ? "" : "s"} × {colCount} col
            {colCount === 1 ? "" : "s"}
          </span>
        </div>
      )}

      <div
        ref={scrollerRef}
        onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
        style={{ maxHeight: height }}
        className="relative overflow-auto rounded-lg border border-border bg-card"
      >
        <table className="w-full border-collapse text-left text-sm">
          <thead className="sticky top-0 z-10">
            <tr className="bg-muted/95 backdrop-blur supports-[backdrop-filter]:bg-muted/80">
              {showRowNumbers && (
                <th className="sticky left-0 z-20 w-10 border-b border-r border-border bg-muted px-2 text-center text-sm font-medium text-muted-foreground">
                  #
                </th>
              )}
              {table.headers.map((header, colIdx) => {
                const active = sort?.col === colIdx;
                return (
                  <th
                    key={colIdx}
                    className="border-b border-r border-border px-0 align-middle last:border-r-0"
                    style={{ minWidth: 120 }}
                  >
                    <div className="flex items-center gap-1 px-1">
                      {canEdit ? (
                        <input
                          value={header}
                          aria-label={`Header for column ${colIdx + 1}`}
                          onChange={(e) => setHeader(colIdx, e.target.value)}
                          className="min-w-0 flex-1 bg-transparent px-1.5 py-2 text-sm font-semibold text-foreground outline-none focus-visible:bg-accent/50"
                        />
                      ) : (
                        <span className="flex-1 px-1.5 py-2 text-sm font-semibold text-foreground">
                          {header}
                        </span>
                      )}
                      {sortable && (
                        <button
                          type="button"
                          onClick={() => toggleSort(colIdx)}
                          aria-label={`Sort by ${header || `column ${colIdx + 1}`}`}
                          className={cn(
                            "rounded p-0.5 text-muted-foreground outline-none hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring",
                            active && "text-primary",
                          )}
                        >
                          <Icon
                            name={
                              active
                                ? sort.dir === "asc"
                                  ? "ArrowUp"
                                  : "ArrowDown"
                                : "ChevronsUpDown"
                            }
                            size={13}
                          />
                        </button>
                      )}
                      {canEdit && colCount > 1 && (
                        <button
                          type="button"
                          onClick={() => deleteColumn(colIdx)}
                          aria-label={`Delete column ${colIdx + 1}`}
                          className="rounded p-0.5 text-muted-foreground outline-none hover:bg-destructive/10 hover:text-destructive focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <Icon name="Trash2" size={12} />
                        </button>
                      )}
                    </div>
                  </th>
                );
              })}
              {canEdit && (
                <th className="w-8 border-b border-border bg-muted" aria-hidden />
              )}
            </tr>
          </thead>

          <tbody>
            {total === 0 ? (
              <tr>
                <td
                  colSpan={colCount + (showRowNumbers ? 1 : 0) + (canEdit ? 1 : 0)}
                  className="px-4 py-10 text-center text-sm text-muted-foreground"
                >
                  {emptyLabel}
                </td>
              </tr>
            ) : (
              <>
                {padTop > 0 && (
                  <tr aria-hidden style={{ height: padTop }}>
                    <td colSpan={colCount + (showRowNumbers ? 1 : 0) + (canEdit ? 1 : 0)} />
                  </tr>
                )}
                {displayOrder.slice(first, last).map((rowIdx, i) => {
                  const row = rows[rowIdx];
                  if (!row) return null;
                  const displayIndex = first + i;
                  return (
                    <tr
                      key={rowIdx}
                      className="group hover:bg-accent/30"
                      style={{ height: ROW_HEIGHT }}
                    >
                      {showRowNumbers && (
                        <td className="sticky left-0 z-[1] w-10 border-b border-r border-border bg-card px-2 text-center text-sm text-muted-foreground tabular-nums group-hover:bg-accent/30">
                          {displayIndex + 1}
                        </td>
                      )}
                      {row.map((cell, colIdx) => {
                        const isEditing =
                          editing?.row === rowIdx && editing.col === colIdx;
                        return (
                          <td
                            key={colIdx}
                            className="border-b border-r border-border p-0 align-middle last:border-r-0"
                            onClick={() =>
                              canEdit && setEditing({ row: rowIdx, col: colIdx })
                            }
                          >
                            {canEdit && isEditing ? (
                              <input
                                autoFocus
                                value={cell}
                                aria-label={`Row ${displayIndex + 1}, ${
                                  table.headers[colIdx] || `column ${colIdx + 1}`
                                }`}
                                onChange={(e) =>
                                  setCell(rowIdx, colIdx, e.target.value)
                                }
                                onBlur={() => setEditing(null)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" || e.key === "Escape") {
                                    e.preventDefault();
                                    setEditing(null);
                                  }
                                }}
                                onPaste={(e) => {
                                  const text = e.clipboardData.getData("text");
                                  if (text.includes("\t") || text.includes("\n")) {
                                    e.preventDefault();
                                    pasteAt(rowIdx, colIdx, text);
                                    setEditing(null);
                                  }
                                }}
                                className="h-[33px] w-full bg-background px-2 font-mono text-[13px] text-foreground outline-none ring-2 ring-inset ring-primary"
                              />
                            ) : (
                              <div
                                className={cn(
                                  "flex h-[33px] items-center truncate px-2 font-mono text-[13px] text-foreground",
                                  canEdit && "cursor-text",
                                )}
                                title={cell}
                              >
                                {cell || (
                                  <span className="text-muted-foreground/40">
                                    —
                                  </span>
                                )}
                              </div>
                            )}
                          </td>
                        );
                      })}
                      {canEdit && (
                        <td className="w-8 border-b border-border p-0 text-center align-middle">
                          <button
                            type="button"
                            onClick={() => deleteRow(rowIdx)}
                            aria-label={`Delete row ${displayIndex + 1}`}
                            className="grid size-10 place-items-center text-muted-foreground opacity-0 outline-none transition-opacity hover:text-destructive focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring group-hover:opacity-100"
                          >
                            <Icon name="X" size={14} />
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
                {padBottom > 0 && (
                  <tr aria-hidden style={{ height: padBottom }}>
                    <td colSpan={colCount + (showRowNumbers ? 1 : 0) + (canEdit ? 1 : 0)} />
                  </tr>
                )}
              </>
            )}
          </tbody>
        </table>
      </div>

      {capped && (
        <p className="flex items-center gap-1.5 text-sm text-amber-600 dark:text-amber-400">
          <Icon name="TriangleAlert" size={13} />
          Showing the first {maxRows.toLocaleString()} rows. Split the file to
          work with the rest.
        </p>
      )}
    </div>
  );
}

/** A compact toolbar button used inside the grid header. */
function GridButton({
  icon,
  label,
  onClick,
}: {
  icon: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1 text-sm font-medium text-foreground outline-none transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Icon name={icon} size={13} />
      {label}
    </button>
  );
}
