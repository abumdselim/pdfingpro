"use client";

import Link from "next/link";
import LegalPageLayout, { type LegalSection } from "@/components/layout/LegalPageLayout";
import { useTranslation } from "@/lib/i18n";

const SECTIONS: LegalSection[] = [
  {
    id: "acceptance",
    titleKey: "legal.terms.sections.acceptance.title",
    paragraphKeys: ["legal.terms.sections.acceptance.p1", "legal.terms.sections.acceptance.p2"],
  },
  {
    id: "eligibility",
    titleKey: "legal.terms.sections.eligibility.title",
    paragraphKeys: ["legal.terms.sections.eligibility.p1", "legal.terms.sections.eligibility.p2"],
  },
  {
    id: "service",
    titleKey: "legal.terms.sections.service.title",
    paragraphKeys: ["legal.terms.sections.service.p1", "legal.terms.sections.service.p2"],
    listKeys: [
      "legal.terms.sections.service.l1",
      "legal.terms.sections.service.l2",
      "legal.terms.sections.service.l3",
      "legal.terms.sections.service.l4",
    ],
  },
  {
    id: "processing-models",
    titleKey: "legal.terms.sections.processingModels.title",
    paragraphKeys: ["legal.terms.sections.processingModels.p1"],
    listKeys: [
      "legal.terms.sections.processingModels.l1",
      "legal.terms.sections.processingModels.l2",
      "legal.terms.sections.processingModels.l3",
    ],
  },
  {
    id: "accounts",
    titleKey: "legal.terms.sections.accounts.title",
    paragraphKeys: ["legal.terms.sections.accounts.p1"],
  },
  {
    id: "acceptable-use",
    titleKey: "legal.terms.sections.acceptableUse.title",
    paragraphKeys: ["legal.terms.sections.acceptableUse.p1"],
    listKeys: [
      "legal.terms.sections.acceptableUse.l1",
      "legal.terms.sections.acceptableUse.l2",
      "legal.terms.sections.acceptableUse.l3",
      "legal.terms.sections.acceptableUse.l4",
      "legal.terms.sections.acceptableUse.l5",
      "legal.terms.sections.acceptableUse.l6",
    ],
  },
  {
    id: "your-content",
    titleKey: "legal.terms.sections.yourContent.title",
    paragraphKeys: [
      "legal.terms.sections.yourContent.p1",
      "legal.terms.sections.yourContent.p2",
      "legal.terms.sections.yourContent.p3",
    ],
  },
  {
    id: "disclaimer",
    titleKey: "legal.terms.sections.disclaimer.title",
    paragraphKeys: [
      "legal.terms.sections.disclaimer.p1",
      "legal.terms.sections.disclaimer.p2",
      "legal.terms.sections.disclaimer.p3",
    ],
  },
  {
    id: "liability",
    titleKey: "legal.terms.sections.liability.title",
    paragraphKeys: ["legal.terms.sections.liability.p1", "legal.terms.sections.liability.p2"],
  },
  {
    id: "indemnification",
    titleKey: "legal.terms.sections.indemnification.title",
    paragraphKeys: ["legal.terms.sections.indemnification.p1"],
  },
  {
    id: "intellectual-property",
    titleKey: "legal.terms.sections.intellectualProperty.title",
    paragraphKeys: [
      "legal.terms.sections.intellectualProperty.p1",
      "legal.terms.sections.intellectualProperty.p2",
    ],
  },
  {
    id: "modifications",
    titleKey: "legal.terms.sections.modifications.title",
    paragraphKeys: ["legal.terms.sections.modifications.p1", "legal.terms.sections.modifications.p2"],
  },
  {
    id: "termination",
    titleKey: "legal.terms.sections.termination.title",
    paragraphKeys: [
      "legal.terms.sections.termination.p1",
      "legal.terms.sections.termination.p2",
    ],
  },
  {
    id: "governing-law",
    titleKey: "legal.terms.sections.governingLaw.title",
    paragraphKeys: ["legal.terms.sections.governingLaw.p1", "legal.terms.sections.governingLaw.p2"],
  },
  {
    id: "contact",
    titleKey: "legal.terms.sections.contact.title",
    paragraphKeys: ["legal.terms.sections.contact.p1"],
  },
];

export default function TermsPageContent() {
  const { t } = useTranslation();

  return (
    <LegalPageLayout
      icon="gavel"
      iconClass="bg-slate-100 text-slate-700"
      titleKey="legal.terms.title"
      subtitleKey="legal.terms.subtitle"
      lastUpdatedKey="legal.terms.lastUpdated"
      sections={SECTIONS}
    >
      <div className="glass-panel rounded-2xl p-6 sm:p-8 text-center">
        <p className="text-sm text-slate-500 dark:text-slate-400">{t("legal.terms.related")}</p>
        <div className="flex flex-wrap items-center justify-center gap-4 mt-4 text-sm font-medium">
          <Link href="/privacy" className="text-[#1461bd] hover:underline">
            {t("legal.footer.privacy")}
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
