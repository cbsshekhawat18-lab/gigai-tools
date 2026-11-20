import benchmarks from "@/config/benchmarks.json";
import { Container } from "@/components/shared/container";
import { SectionHeading } from "@/components/shared/section-heading";

/**
 * Measured results (specs/per-tool-geo.md Phase 3): real numbers from running
 * THIS tool against a fixed sample set, re-run per release by
 * QA/helpers/bench.mjs. Server-rendered - fact density is the strongest
 * single correlate of AI citation, and these numbers are ours alone.
 * Renders nothing for tools without a benchmark row.
 */

interface BenchRow {
  sample: string;
  result: string;
  inputBytes: number;
  outputBytes: number;
  ms: number;
  note: string;
}

interface BenchFile {
  common: { measuredOn: string; environment: string };
  tools: Record<string, BenchRow>;
}

const DATA = benchmarks as unknown as BenchFile;

export function getBenchmark(slug: string): BenchRow | null {
  return DATA.tools[slug] ?? null;
}

export function MeasuredResults({ slug }: { slug: string }) {
  const row = getBenchmark(slug);
  if (!row) return null;
  const { measuredOn, environment } = DATA.common;

  return (
    <section id="measured" className="py-10 sm:py-14">
      <Container>
        <SectionHeading
          title="Measured results"
          description="Numbers from running this exact tool against a fixed public sample, not marketing claims."
        />
        <div className="mt-6 overflow-hidden rounded-lg border border-border">
          <table className="w-full text-sm">
            <tbody>
              <tr className="bg-muted/30">
                <th scope="row" className="w-1/3 px-4 py-3 text-left font-medium text-foreground">
                  Sample
                </th>
                <td className="px-4 py-3 text-muted-foreground">{row.sample}</td>
              </tr>
              <tr>
                <th scope="row" className="px-4 py-3 text-left font-medium text-foreground">
                  Result
                </th>
                <td className="px-4 py-3 font-mono text-sm font-medium text-primary">
                  {row.result}
                </td>
              </tr>
              <tr className="bg-muted/30">
                <th scope="row" className="px-4 py-3 text-left font-medium text-foreground">
                  Worth knowing
                </th>
                <td className="px-4 py-3 text-muted-foreground">{row.note}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Measured on {measuredOn} using {environment}. Re-measured with each release. The
          harness and samples are part of this site&apos;s test suite.
        </p>
      </Container>
    </section>
  );
}
