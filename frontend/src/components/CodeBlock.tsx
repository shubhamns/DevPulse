import { CopyButton } from "@/components/CopyButton";

type CodeBlockProps = {
  code: string;
  copyLabel?: string;
};

export function CodeBlock({ code, copyLabel = "Copy" }: CodeBlockProps) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-slate-950">
      <pre className="overflow-x-auto p-4 text-sm leading-6 text-slate-200">
        <code>{code}</code>
      </pre>
      <div className="absolute top-3 right-3">
        <CopyButton value={code} label={copyLabel} />
      </div>
    </div>
  );
}
