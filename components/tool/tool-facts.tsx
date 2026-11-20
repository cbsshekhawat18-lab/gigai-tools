import type { Tool } from "@/types";
import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { toolDifficulty, toolEstTime } from "@/lib/tool-meta";
import { toolProcessingBadge } from "@/lib/privacy";
import { convertFormats } from "@/lib/tool-art/illustrations";

/**
 * "At a glance" facts strip for a tool page: difficulty, rough time estimate,
 * where processing happens and (for converters) the format pair. Server
 * component, zero client JS; derivations shared with the assistant
 * (`lib/tool-meta`) and the transparency badge (`lib/privacy`) so every
 * surface tells the same story.
 */
export function ToolFacts({
  tool,
  className,
}: {
  tool: Pick<Tool, "slug" | "category" | "serverSide" | "processor">;
  className?: string;
}) {
  const difficulty = toolDifficulty(tool);
  const estTime = toolEstTime(tool);
  const processing = toolProcessingBadge(tool);
  const formats = convertFormats(tool.slug);

  const facts: Array<{ icon: string; label: string; value: string }> = [
    { icon: "Gauge", label: "Difficulty", value: difficulty },
    { icon: "Clock", label: "Typical time", value: estTime },
    { icon: processing.icon, label: "Processing", value: processing.label },
  ];
  if (formats && formats[0] && formats[1]) {
    facts.push({ icon: "ArrowLeftRight", label: "Converts", value: `${formats[0]} → ${formats[1]}` });
  }

  return (
    <dl
      aria-label="Tool at a glance"
      className={cn(
        "flex flex-wrap items-center gap-x-6 gap-y-2 text-sm",
        className,
      )}
    >
      {facts.map((f) => (
        <div key={f.label} className="flex items-center gap-2">
          <Icon name={f.icon} size={15} className="shrink-0 text-muted-foreground" />
          <dt className="text-muted-foreground">{f.label}:</dt>
          <dd className="font-medium text-foreground">{f.value}</dd>
        </div>
      ))}
    </dl>
  );
}
