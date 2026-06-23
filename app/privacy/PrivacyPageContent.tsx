"use client";

import Link from "next/link";
import LegalPageLayout, { type LegalSection } from "@/components/layout/LegalPageLayout";
import { useTranslation } from "@/lib/i18n";

const SECTIONS: LegalSection[] = [
  {
    id: "overview",
    titleKey: "legal.privacy.sections.overview.title",
    paragraphKeys: ["legal.privacy.sections.overview.p1", "legal.privacy.sections.overview.p2"],
  },
  {
    id: "processing-models",
    titleKey: "legal.privacy.sections.processingModels.title",
    paragraphKeys: ["legal.privacy.sections.processingModels.p1"],
    listKeys: [
      "legal.privacy.sections.processingModels.l1",
      "legal.privacy.sections.processingModels.l2",
      "legal.privacy.sections.processingModels.l3",
    ],
  },
  {
    id: "client-side",
    titleKey: "legal.privacy.sections.clientSide.title",
    paragraphKeys: ["legal.privacy.sections.clientSide.p1"],
    listKeys: [
      "legal.privacy.sections.clientSide.l1",
      "legal.privacy.sections.clientSide.l2",
      "legal.privacy.sections.clientSide.l3",
      "legal.privacy.sections.clientSide.l4",
    ],
  },
  {
    id: "website-to-pdf",
    titleKey: "legal.privacy.sections.websiteToPdf.title",
    paragraphKeys: [
      "legal.privacy.sections.websiteToPdf.p1",
      "legal.privacy.sections.websiteToPdf.p2",
    ],
  },
  {
    id: "limited-tools",
    titleKey: "legal.privacy.sections.limitedTools.title",
    paragraphKeys: ["legal.privacy.sections.limitedTools.p1"],
    listKeys: [
      "legal.privacy.sections.limitedTools.l1",
      "legal.privacy.sections.limitedTools.l2",
    ],
  },
  {
    id: "local-preferences",
    titleKey: "legal.privacy.sections.localPreferences.title",
    paragraphKeys: [
      "legal.privacy.sections.localPreferences.p1",
      "legal.privacy.sections.localPreferences.p3",
    ],
    listKeys: [
      "legal.privacy.sections.localPreferences.l1",
      "legal.privacy.sections.localPreferences.l2",
    ],
  },
  {
    id: "data-we-collect",
    titleKey: "legal.privacy.sections.dataWeCollect.title",
    paragraphKeys: ["legal.privacy.sections.dataWeCollect.p1"],
    listKeys: [
      "legal.privacy.sections.dataWeCollect.l1",
      "legal.privacy.sections.dataWeCollect.l2",
      "legal.privacy.sections.dataWeCollect.l3",
    ],
  },
  {
    id: "data-we-dont-collect",
    titleKey: "legal.privacy.sections.dataWeDontCollect.title",
    paragraphKeys: ["legal.privacy.sections.dataWeDontCollect.p1"],
    listKeys: [
      "legal.privacy.sections.dataWeDontCollect.l1",
      "legal.privacy.sections.dataWeDontCollect.l2",
      "legal.privacy.sections.dataWeDontCollect.l3",
      "legal.privacy.sections.dataWeDontCollect.l4",
      "legal.privacy.sections.dataWeDontCollect.l5",
    ],
  },
  {
    id: "third-party",
    titleKey: "legal.privacy.sections.thirdParty.title",
    paragraphKeys: [
      "legal.privacy.sections.thirdParty.p1",
      "legal.privacy.sections.thirdParty.p3",
    ],
    listKeys: [
      "legal.privacy.sections.thirdParty.l1",
      "legal.privacy.sections.thirdParty.l2",
    ],
  },
  {
    id: "security",
    titleKey: "legal.privacy.sections.security.title",
    paragraphKeys: [
      "legal.privacy.sections.security.p1",
      "legal.privacy.sections.security.p2",
    ],
  },
  {
    id: "your-rights",
    titleKey: "legal.privacy.sections.yourRights.title",
    paragraphKeys: [
      "legal.privacy.sections.yourRights.p1",
      "legal.privacy.sections.yourRights.p2",
    ],
  },
  {
    id: "retention",
    titleKey: "legal.privacy.sections.retention.title",
    paragraphKeys: ["legal.privacy.sections.retention.p1", "legal.privacy.sections.retention.p2"],
  },
  {
    id: "children",
    titleKey: "legal.privacy.sections.children.title",
    paragraphKeys: ["legal.privacy.sections.children.p1"],
  },
  {
    id: "changes",
    titleKey: "legal.privacy.sections.changes.title",
    paragraphKeys: ["legal.privacy.sections.changes.p1"],
  },
  {
    id: "contact",
    titleKey: "legal.privacy.sections.contact.title",
    paragraphKeys: ["legal.privacy.sections.contact.p1"],
  },
];

export default function PrivacyPageContent() {
  const { t } = useTranslation();

  return (
    <LegalPageLayout
      icon="shield_lock"
      titleKey="legal.privacy.title"
      subtitleKey="legal.privacy.subtitle"
      lastUpdatedKey="legal.privacy.lastUpdated"
      sections={SECTIONS}
    >
      <div className="glass-panel rounded-2xl p-6 sm:p-8 text-center">
        <p className="text-sm text-slate-500 dark:text-slate-400">{t("legal.privacy.related")}</p>
        <div className="flex flex-wrap items-center justify-center gap-4 mt-4 text-sm font-medium">
          <Link href="/terms" className="text-[#1461bd] hover:underline">
            {t("legal.footer.terms")}
          </Link>
          <span className="text-slate-300 dark:text-slate-600">·</span>
          <Link href="/contact" className="text-[#1461bd] hover:underline">
            {t("legal.footer.contact")}
          </Link>
        </div>
      </div>
    </LegalPageLayout>
  );
}
