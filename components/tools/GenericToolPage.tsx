"use client";

import { useState } from "react";
import ToolLayout, { ToolCard, PrimaryButton, DownloadSuccess } from "@/components/shared/ToolLayout";
import FileDropzone from "@/components/shared/FileDropzone";
import { TOOLS } from "@/lib/tools";
import { GENERIC_TOOL_CONFIG, camelToolId } from "@/lib/generic-tools";
import { runGenericTool } from "@/lib/generic-tool-runner";
import { downloadBlob } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";

interface GenericToolPageProps {
  toolId: string;
}

export default function GenericToolPage({ toolId }: GenericToolPageProps) {
  const { t } = useTranslation();
  const tool = TOOLS.find((x) => x.id === toolId);
  const config = GENERIC_TOOL_CONFIG[toolId];
  const key = camelToolId(toolId);

  const [file, setFile] = useState<File | null>(null);
  const [file2, setFile2] = useState<File | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [text, setText] = useState(toolId === "create-pdf-form" ? "name|Full Name\nemail|Email" : "");
  const [url, setUrl] = useState("https://pdfing.pro.bd");
  const [count, setCount] = useState("1");
  const [n, setN] = useState("2");
  const [color, setColor] = useState("#f8fafc");
  const [labelFormat, setLabelFormat] = useState("Page {n}");
  const [position, setPosition] = useState("1");
  const [from, setFrom] = useState("1");
  const [to, setTo] = useState("1");
  const [invoice, setInvoice] = useState({ number: "INV-001", date: "", toName: "", fromName: "", item: "Service", amount: "100", notes: "" });
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validateReport, setValidateReport] = useState<Record<string, unknown> | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [result, setResult] = useState<{ blob: Blob; filename: string } | null>(null);

  if (!tool || !config) return null;

  const handleRun = async () => {
    setProcessing(true);
    setError(null);
    setValidateReport(null);
    setWarnings([]);
    setResult(null);
    try {
      const out = await runGenericTool({
        toolId,
        file,
        file2,
        files,
        text,
        url,
        count: Number(count),
        n: Number(n),
        color,
        labelFormat,
        position: Number(position),
        from: Number(from),
        to: Number(to),
        invoice,
      });

      if (out.kind === "pdf" || out.kind === "warnings") {
        const blob = new Blob([out.bytes as unknown as BlobPart], { type: "application/pdf" });
        setResult({ blob, filename: out.filename });
        if (out.kind === "warnings") setWarnings(out.warnings);
      } else if (out.kind === "text" || out.kind === "json") {
        const mime = out.kind === "json" ? "application/json" : "text/plain";
        downloadBlob(new Blob([out.content], { type: mime }), out.filename);
        setResult({ blob: new Blob([out.content]), filename: out.filename });
      } else if (out.kind === "zip") {
        downloadBlob(out.blob, out.filename);
        setResult({ blob: out.blob, filename: out.filename });
      } else if (out.kind === "validate") {
        setValidateReport(out.report);
      }
    } catch (err: unknown) {
      setError((err as Error)?.message ?? t(`${key}.error`));
    } finally {
      setProcessing(false);
    }
  };

  const reset = () => {
    setFile(null);
    setFile2(null);
    setFiles([]);
    setResult(null);
    setValidateReport(null);
    setWarnings([]);
    setError(null);
  };

  const needsText = ["text-to-pdf", "create-form"].includes(config.mode) || toolId === "json-to-pdf" || toolId === "xml-to-pdf";
  const needsPdf = config.mode !== "text-to-pdf" && config.mode !== "create-form" && config.mode !== "invoice-form";
  const needsDual = config.mode === "dual-pdf";
  const needsImages = config.mode === "images";

  return (
    <ToolLayout title={t(tool.titleKey)} description={t(`${key}.pageDescription`)} icon={tool.icon} iconClass={config.iconClass}>
      {result && config.mode !== "pdf-validate" ? (
        <ToolCard>
          {warnings.length > 0 && (
            <ul className="text-xs text-amber-700 bg-amber-50 px-3 py-2 rounded mb-4 space-y-1">
              {warnings.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
          )}
          <DownloadSuccess onDownload={() => downloadBlob(result.blob, result.filename)} onReset={reset} filename={result.filename} />
        </ToolCard>
      ) : (
        <div className="space-y-4">
          {needsText && (
            <ToolCard>
              <textarea value={text} onChange={(e) => setText(e.target.value)} rows={12} className="ds-input font-mono text-sm w-full" />
            </ToolCard>
          )}
          {needsImages && (
            <ToolCard>
              <FileDropzone onFiles={(f) => setFiles((p) => [...p, ...f])} files={files} maxFiles={30} />
            </ToolCard>
          )}
          {needsPdf && (
            <ToolCard>
              <FileDropzone onFiles={(f) => setFile(f[0])} files={file ? [file] : []} />
            </ToolCard>
          )}
          {needsDual && (
            <ToolCard>
              <p className="text-sm font-semibold mb-2">Second PDF</p>
              <FileDropzone onFiles={(f) => setFile2(f[0])} files={file2 ? [file2] : []} />
            </ToolCard>
          )}
          {toolId === "qr-code-pdf" && (
            <ToolCard>
              <input value={url} onChange={(e) => setUrl(e.target.value)} className="ds-input w-full" placeholder="https://..." />
            </ToolCard>
          )}
          {toolId === "add-blank-pages" && (
            <ToolCard>
              <input type="number" min={1} value={count} onChange={(e) => setCount(e.target.value)} className="ds-input" />
            </ToolCard>
          )}
          {toolId === "split-every-n-pages" && (
            <ToolCard>
              <label className="text-sm">Pages per file</label>
              <input type="number" min={1} value={n} onChange={(e) => setN(e.target.value)} className="ds-input mt-1" />
            </ToolCard>
          )}
          {toolId === "add-background-pdf" && (
            <ToolCard>
              <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-10 w-20" />
            </ToolCard>
          )}
          {toolId === "page-labels-pdf" && (
            <ToolCard>
              <input value={labelFormat} onChange={(e) => setLabelFormat(e.target.value)} className="ds-input w-full" placeholder="Page {n}" />
            </ToolCard>
          )}
          {toolId === "insert-pages-pdf" && (
            <ToolCard>
              <input type="number" min={1} value={position} onChange={(e) => setPosition(e.target.value)} className="ds-input" />
            </ToolCard>
          )}
          {toolId === "replace-pages-pdf" && (
            <ToolCard className="grid grid-cols-2 gap-2">
              <input type="number" min={1} value={from} onChange={(e) => setFrom(e.target.value)} className="ds-input" />
              <input type="number" min={1} value={to} onChange={(e) => setTo(e.target.value)} className="ds-input" />
            </ToolCard>
          )}
          {toolId === "invoice-pdf" && (
            <ToolCard className="space-y-2">
              {Object.entries(invoice).map(([k, v]) => (
                <input key={k} value={v} onChange={(e) => setInvoice((p) => ({ ...p, [k]: e.target.value }))} className="ds-input w-full" placeholder={k} />
              ))}
            </ToolCard>
          )}
          {validateReport && (
            <ToolCard>
              <pre className="text-xs bg-slate-50 p-3 rounded overflow-auto">{JSON.stringify(validateReport, null, 2)}</pre>
            </ToolCard>
          )}
          {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded">{error}</p>}
          <PrimaryButton onClick={handleRun} loading={processing}>{t(`${key}.button`)}</PrimaryButton>
        </div>
      )}
    </ToolLayout>
  );
}
