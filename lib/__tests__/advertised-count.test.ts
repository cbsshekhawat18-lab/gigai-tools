import { describe, expect, it } from "vitest";
import { execSync } from "node:child_process";
import { advertisedToolCount, getTotalToolCount } from "../registry";

/**
 * The tool count drifted TWICE (240+/248/249/250+ in 2026-07, then 260+ vs a
 * live 273 in 2026-09) because marketing strings hardcoded it. The rule now:
 * exact counts come from the registry at render time, everything else is
 * count-free. This test makes a third drift impossible: no source file may
 * contain a hardcoded "NNN+ tools" claim.
 */
describe("advertised tool count", () => {
  it("helper stays a rounded-down, never-overstating claim", () => {
    const n = getTotalToolCount();
    expect(n).toBeGreaterThan(200);
    expect(advertisedToolCount()).toBe(`${Math.floor(n / 10) * 10}+`);
  });

  it("no source file hardcodes a three-digit tool-count claim", () => {
    let out = "";
    try {
      out = execSync(
        "grep -rEn '[0-9]{3}\\+ ?(free )?(GigAI )?tools' app components modules config content --include='*.ts' --include='*.tsx' --include='*.md' | grep -v 'config/tools/geo/' || true",
        { encoding: "utf8", cwd: `${__dirname}/../..` },
      );
    } catch {
      out = "";
    }
    // config/tools/geo/ is excluded: the entity-consistency tool's copy uses
    // made-up counts as EXAMPLES of the mistake, which is not a claim.
    expect(out.trim(), `hardcoded tool counts found:\n${out}`).toBe("");
  });
});
