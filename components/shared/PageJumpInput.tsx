"use client";

import React, { useState, useRef, useEffect } from "react";

interface PageJumpInputProps {
  currentPage: number;
  totalPages: number;
  onJump: (pageIndex: number) => void;
  className?: string;
}

/**
 * Quick page jump input for mobile navigation
 * Allows direct page number entry
 */
export default function PageJumpInput({
  currentPage,
  totalPages,
  onJump,
  className = "",
}: PageJumpInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const pageNum = parseInt(inputValue, 10);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
      onJump(pageNum - 1); // Convert to 0-indexed
      setIsOpen(false);
      setInputValue("");
    }
  };

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => {
          setIsOpen(true);
          setInputValue(String(currentPage + 1));
        }}
        className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-xs font-semibold shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 hover:shadow hover:-translate-y-px transition-all duration-300 ${className}`}
        aria-label="Jump to page"
      >
        <span className="material-symbols-outlined text-[18px] text-teal-600">search</span>
        <span>
          Page {currentPage + 1} of {totalPages}
        </span>
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-slate-800 ring-2 ring-teal-500/80 shadow-md animate-fade-in ${className}`}
    >
      <span className="material-symbols-outlined text-[18px] text-teal-600">
        search
      </span>
      <input
        ref={inputRef}
        type="number"
        min={1}
        max={totalPages}
        value={inputValue}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputValue(e.target.value)}
        onBlur={() => {
          setTimeout(() => setIsOpen(false), 150);
        }}
        className="w-10 text-sm font-bold text-center text-teal-700 bg-transparent border-none outline-none focus:ring-0 placeholder-teal-300"
        placeholder="#"
        aria-label="Enter page number"
      />
      <span className="text-xs font-medium text-slate-400">/ {totalPages}</span>
    </form>
  );
}
