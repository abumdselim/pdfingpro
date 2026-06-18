"use client";



import { useCallback, type MouseEvent } from "react";

import { useDropzone, type Accept } from "react-dropzone";

import { cn, formatBytes } from "@/lib/utils";

import { useTranslation } from "@/lib/i18n";

import { ui } from "@/lib/theme/ui";



interface FileDropzoneProps {

  onFiles: (files: File[]) => void;

  onRemove?: (index: number) => void;

  accept?: Accept;

  maxFiles?: number;

  files?: File[];

  label?: string;

  sublabel?: string;

  className?: string;

}



export default function FileDropzone({

  onFiles,

  onRemove,

  accept = { "application/pdf": [".pdf"] },

  maxFiles = 1,

  files = [],

  label,

  sublabel,

  className,

}: FileDropzoneProps) {

  const { t } = useTranslation();

  const onDrop = useCallback(

    (accepted: File[]) => {

      if (accepted.length > 0) onFiles(accepted);

    },

    [onFiles]

  );



  const handleRemove = useCallback(

    (e: MouseEvent, index: number) => {

      e.stopPropagation();

      e.preventDefault();

      if (onRemove) {

        onRemove(index);

      } else if (maxFiles === 1) {

        onFiles([]);

      } else {

        onFiles(files.filter((_, idx) => idx !== index));

      }

    },

    [onRemove, maxFiles, onFiles, files]

  );



  const hasFiles = files.length > 0;



  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({

    onDrop,

    accept,

    maxFiles,

    multiple: maxFiles !== 1,

    noClick: hasFiles,

    noKeyboard: hasFiles,

  });



  const resolvedLabel = label ?? t("common.dropPdfHere");



  return (

    <div

      {...getRootProps()}

      className={cn(

        "group relative flex flex-col items-center justify-center gap-5 border-2 border-dashed rounded-[2rem] cursor-pointer transition-all duration-500 select-none overflow-hidden",

        isDragActive ? ui.dropzoneActive : ui.dropzone,

        "hover:shadow-sm",

        hasFiles ? "py-8" : "py-20",

        className

      )}

    >

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-teal-400/5 dark:bg-teal-400/10 rounded-full blur-3xl pointer-events-none group-hover:bg-teal-400/10 dark:group-hover:bg-teal-400/15 transition-colors duration-500" />



      <input {...getInputProps()} />



      {!hasFiles ? (

        <>

          <div

            className={cn(

              "w-20 h-20 rounded-3xl flex items-center justify-center transition-all duration-500 shadow-sm relative z-10 group-hover:-translate-y-1",

              isDragActive

                ? "bg-teal-500 text-white shadow-teal-500/30"

                : "bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 group-hover:text-teal-600 dark:group-hover:text-teal-400"

            )}

          >

            <span className="material-symbols-outlined text-[36px] transition-transform duration-500 group-hover:scale-110">

              cloud_upload

            </span>

          </div>

          <div className="text-center px-4 relative z-10">

            <p className={cn("text-lg font-bold", ui.subheading)}>{resolvedLabel}</p>

            <p className={cn("text-sm font-medium mt-1.5", ui.muted)}>

              {sublabel ??

                (maxFiles > 1

                  ? t("common.orClickToSelectMultiple", { max: maxFiles })

                  : t("common.orClickToSelect"))}

            </p>

          </div>

          <div

            className={cn(

              "text-xs font-semibold bg-white dark:bg-slate-800 border px-4 py-1.5 rounded-full shadow-sm relative z-10",

              ui.faint,

              ui.border

            )}

          >

            {Object.values(accept).flat().join(", ")}

          </div>

        </>

      ) : (

        <div className="w-full max-w-lg mx-auto px-6 space-y-2 relative z-10">

          {files.map((f, i) => (

            <div key={i} className={ui.fileRow}>

              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", ui.iconBadge)}>

                <span className="material-symbols-outlined text-[20px]">picture_as_pdf</span>

              </div>

              <div className="flex-1 min-w-0">

                <p className={cn("truncate font-semibold", ui.subheading)}>{f.name}</p>

                <p className={cn("text-xs", ui.muted)}>{formatBytes(f.size)}</p>

              </div>

              <button

                type="button"

                aria-label={t("common.removeFile")}

                onClick={(e) => handleRemove(e, i)}

                className="w-8 h-8 rounded-full hover:bg-red-50 dark:hover:bg-red-950/30 text-slate-300 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 flex items-center justify-center transition-colors cursor-pointer"

              >

                <span className="material-symbols-outlined text-[18px]">close</span>

              </button>

            </div>

          ))}

          <p

            className={cn("text-xs font-medium pt-4 text-center cursor-pointer hover:text-teal-600 dark:hover:text-teal-400 transition-colors", ui.faint)}

            onClick={(e) => {

              e.stopPropagation();

              open();

            }}

          >

            {t("common.clickOrDropToReplace")}

          </p>

        </div>

      )}

    </div>

  );

}


