"use client";



export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-sm text-slate-500">
          © {new Date().getFullYear()} HelloPDF by{" "}
          <a
            href="https://inievo.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-slate-700 transition-colors"
          >
            Inievo Technologies
          </a>.
        </p>
      </div>
    </footer>
  );
}
