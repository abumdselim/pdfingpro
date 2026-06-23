"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";
import { ui } from "@/lib/theme/ui";

const CONTACT_CHANNELS = [
  {
    icon: "mail",
    titleKey: "legal.contact.channels.email.title",
    bodyKey: "legal.contact.channels.email.body",
    href: "mailto:contact@inievo.com",
    linkLabelKey: "legal.contact.channels.email.link",
    external: false,
  },
  {
    icon: "language",
    titleKey: "legal.contact.channels.website.title",
    bodyKey: "legal.contact.channels.website.body",
    href: "https://inievo.com",
    linkLabelKey: "legal.contact.channels.website.link",
    external: true,
  },
  {
    icon: "bug_report",
    titleKey: "legal.contact.channels.bugs.title",
    bodyKey: "legal.contact.channels.bugs.body",
    href: "mailto:contact@inievo.com?subject=Pdfing%20Pro%20bug%20report",
    linkLabelKey: "legal.contact.channels.bugs.link",
    external: false,
  },
] as const;

const FAQ_ITEMS = [
  {
    questionKey: "legal.contact.faq.privacy.question",
    answerKey: "legal.contact.faq.privacy.answer",
    href: "/privacy",
  },
  {
    questionKey: "legal.contact.faq.terms.question",
    answerKey: "legal.contact.faq.terms.answer",
    href: "/terms",
  },
  {
    questionKey: "legal.contact.faq.data.question",
    answerKey: "legal.contact.faq.data.answer",
    href: "/privacy#client-side",
  },
] as const;

export default function ContactPageContent() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen pt-[var(--app-header-total)] md:pt-14 pb-20">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-teal-50/50 dark:from-teal-950/30 to-transparent -z-10" />
        <div className="max-w-3xl mx-auto px-6 py-12 text-center animate-fade-in-up">
          <Link href="/" className={cn(ui.backLink, "mb-8")}>
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            {t("common.allTools")}
          </Link>

          <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 mb-6 shadow-sm mx-auto", ui.iconBadge)}>
            <span className="material-symbols-outlined text-[32px]">contact_mail</span>
          </div>

          <h1 className={cn("text-3xl sm:text-4xl font-extrabold tracking-tight", ui.heading)}>
            {t("legal.contact.title")}
          </h1>
          <p className={cn("text-lg mt-3 max-w-xl mx-auto leading-relaxed", ui.muted)}>
            {t("legal.contact.subtitle")}
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 space-y-6 animate-fade-in-up" style={{ animationDelay: "80ms" }}>
        <div className="grid gap-4 sm:grid-cols-1">
          {CONTACT_CHANNELS.map((channel) => (
            <a
              key={channel.titleKey}
              href={channel.href}
              target={channel.external ? "_blank" : undefined}
              rel={channel.external ? "noopener noreferrer" : undefined}
              className="glass-panel rounded-2xl p-6 sm:p-8 flex gap-5 items-start hover:shadow-md transition-all duration-300 group"
            >
              <div className="w-12 h-12 rounded-xl bg-[#1461bd]/10 dark:bg-teal-500/15 text-[#1461bd] dark:text-teal-400 flex items-center justify-center shrink-0 group-hover:bg-[#1461bd] dark:group-hover:bg-teal-600 group-hover:text-white transition-colors">
                <span className="material-symbols-outlined text-[24px]">{channel.icon}</span>
              </div>
              <div className="text-left min-w-0">
                <h2 className={cn("text-lg font-bold", ui.heading)}>{t(channel.titleKey)}</h2>
                <p className={cn("text-[15px] mt-1 leading-relaxed", ui.body)}>{t(channel.bodyKey)}</p>
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-[#1461bd] dark:text-teal-400 mt-3 group-hover:underline">
                  {t(channel.linkLabelKey)}
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </span>
              </div>
            </a>
          ))}
        </div>

        <section className="glass-panel rounded-2xl p-6 sm:p-8">
          <h2 className={cn("text-xl font-bold tracking-tight", ui.heading)}>{t("legal.contact.response.title")}</h2>
          <p className={cn("mt-4 text-[15px] leading-relaxed", ui.body)}>{t("legal.contact.response.p1")}</p>
          <ul className={cn("mt-4 list-disc pl-5 space-y-2 text-[15px] marker:text-[#1461bd] dark:marker:text-teal-400", ui.body)}>
            <li>{t("legal.contact.response.l1")}</li>
            <li>{t("legal.contact.response.l2")}</li>
            <li>{t("legal.contact.response.l3")}</li>
          </ul>
        </section>

        <section className="glass-panel rounded-2xl p-6 sm:p-8">
          <h2 className={cn("text-xl font-bold tracking-tight", ui.heading)}>{t("legal.contact.faq.title")}</h2>
          <div className="mt-6 space-y-5">
            {FAQ_ITEMS.map((item) => (
              <div key={item.questionKey} className="border-b border-slate-100 dark:border-slate-800 last:border-0 pb-5 last:pb-0">
                <h3 className={cn("font-semibold", ui.heading)}>{t(item.questionKey)}</h3>
                <p className={cn("text-[15px] mt-2 leading-relaxed", ui.body)}>{t(item.answerKey)}</p>
                <Link href={item.href} className="inline-flex items-center gap-1 text-sm font-medium text-[#1461bd] dark:text-teal-400 mt-2 hover:underline">
                  {t("legal.contact.faq.learnMore")}
                  <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                </Link>
              </div>
            ))}
          </div>
        </section>

        <div className="glass-panel rounded-2xl p-6 sm:p-8 text-center">
          <p className={cn("text-xs sm:text-sm font-medium whitespace-nowrap mx-auto", ui.muted)}>
            {t("legal.contact.maintainedBy")}
          </p>
          <a
            href="https://inievo.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center mt-4 hover:opacity-85 transition-opacity"
            aria-label="Inievo Technologies"
          >
            <img
              src="https://res.cloudinary.com/dgcnhseqm/image/upload/q_auto/f_auto/v1781425405/Inievo_ujfqno.png"
              alt="Inievo Technologies"
              className="h-8 sm:h-10 w-auto max-w-[220px] object-contain dark:brightness-110"
            />
          </a>
        </div>
      </div>
    </div>
  );
}
