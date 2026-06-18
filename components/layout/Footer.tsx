"use client";

import Image from "next/image";
export default function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="bg-[#0b3e7b] mt-auto relative overflow-hidden">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="flex flex-col items-center justify-center gap-8 text-center">
          
          {/* Logo */}
          <div className="flex flex-col items-center gap-3">
            <img 
              src="https://res.cloudinary.com/dgcnhseqm/image/upload/q_auto/f_auto/v1781764576/bengaldesk_2_tc3czo.png" 
              alt="Pdfing Pro Logo" 
              className="h-12 w-auto drop-shadow-sm" 
            />
            <p className="max-w-md text-[13px] text-white/70 leading-relaxed mt-2">
              Pdfing Pro is a secure, 100% client-side PDF utility suite. All operations run locally inside your browser, ensuring your files never leave your device.
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-[13px] font-medium text-white/80">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>

          {/* Initiative by Inievo */}
          <div className="flex items-center justify-center gap-2 mt-4 pt-8 border-t border-white/20 w-full max-w-sm">
            <span className="text-[13px] font-medium text-white/80">An initiative by</span>
            <a href="https://inievo.com" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center hover:opacity-80 transition-opacity">
              <img 
                src="https://res.cloudinary.com/dgcnhseqm/image/upload/q_auto/f_auto/v1781425380/inievo_full_logo_png_pfkkmi.png" 
                alt="Inievo Technologies" 
                className="h-4 w-auto object-contain drop-shadow-sm transition-all duration-300 hover:scale-105"
              />
            </a>
          </div>

        </div>
      </div>
    </footer>
  );
}
