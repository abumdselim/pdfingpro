"use client";

import { useState } from "react";
import ToolLayout, { ToolCard, PrimaryButton } from "@/components/shared/ToolLayout";
import FileDropzone from "@/components/shared/FileDropzone";
import { verifyPdfSignatures, type SignatureInfo } from "@/lib/pdf/forms";
import { useTranslation } from "@/lib/i18n";
import ProcessingBadge from "@/components/shared/ProcessingBadge";

export default function VerifySignaturePage() {
  const { t } = useTranslation();
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [signatures, setSignatures] = useState<SignatureInfo[]>([]);
  const [disclaimer, setDisclaimer] = useState("");
  const [scanned, setScanned] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleScan = async () => {
    if (!file) return;
    setProcessing(true);
    setError(null);
    try {
      const result = await verifyPdfSignatures(await file.arrayBuffer());
      setSignatures(result.signatures);
      setDisclaimer(result.disclaimer);
      setScanned(true);
    } catch (err: unknown) {
      setError((err as Error)?.message ?? t("verifySignature.error"));
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolLayout
      title={t("tools.verifySignaturePdf.title")}
      description={t("verifySignature.pageDescription")}
      icon="verified_user"
      iconClass="bg-red-50 text-red-600"
      processingTier="limited"
    >
      <div className="space-y-4">
        <ToolCard>
          <FileDropzone onFiles={(f) => { setFile(f[0]); setScanned(false); setSignatures([]); setError(null); }} files={file ? [file] : []} />
        </ToolCard>

        {file && !scanned && (
          <>
            <div className="flex justify-center">
              <ProcessingBadge tier="limited" />
            </div>
            {error && <p className="text-sm text-red-600 bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded">{error}</p>}
            <PrimaryButton onClick={handleScan} loading={processing}>
              <span className="material-symbols-outlined text-[18px]">verified_user</span>
              {t("verifySignature.button")}
            </PrimaryButton>
          </>
        )}

        {scanned && (
          <ToolCard className="space-y-4">
            {signatures.length === 0 ? (
              <p className="text-sm text-slate-600 dark:text-slate-400">{t("verifySignature.none")}</p>
            ) : (
              <>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {t("verifySignature.found", { count: signatures.length })}
                </p>
                <ul className="space-y-2">
                  {signatures.map((sig) => (
                    <li key={sig.fieldName} className="text-sm border border-slate-200 dark:border-slate-700 rounded-lg p-3">
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{sig.fieldName}</p>
                      <p className="text-xs text-slate-500 mt-1">{sig.note}</p>
                    </li>
                  ))}
                </ul>
              </>
            )}
            <p className="text-xs text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded p-3">
              {disclaimer || t("verifySignature.disclaimer")}
            </p>
          </ToolCard>
        )}
      </div>
    </ToolLayout>
  );
}
