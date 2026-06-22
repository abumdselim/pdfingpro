import { PDFDocument, PDFTextField, PDFCheckBox, PDFDropdown, PDFOptionList, PDFRadioGroup, PDFSignature } from "pdf-lib";

export interface FormFieldInfo {
  name: string;
  type: "text" | "checkbox" | "dropdown" | "optionlist" | "radio" | "unknown";
  value: string;
  options?: string[];
}

/** List AcroForm fields in a PDF. */
export async function listFormFields(buffer: ArrayBuffer): Promise<FormFieldInfo[]> {
  const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
  const form = doc.getForm();
  const fields = form.getFields();
  const result: FormFieldInfo[] = [];

  for (const field of fields) {
    const name = field.getName();
    if (field instanceof PDFTextField) {
      result.push({ name, type: "text", value: field.getText() ?? "" });
    } else if (field instanceof PDFCheckBox) {
      result.push({ name, type: "checkbox", value: field.isChecked() ? "true" : "false" });
    } else if (field instanceof PDFDropdown) {
      result.push({
        name,
        type: "dropdown",
        value: field.getSelected()?.[0] ?? "",
        options: field.getOptions(),
      });
    } else if (field instanceof PDFOptionList) {
      result.push({
        name,
        type: "optionlist",
        value: field.getSelected()?.[0] ?? "",
        options: field.getOptions(),
      });
    } else if (field instanceof PDFRadioGroup) {
      result.push({
        name,
        type: "radio",
        value: field.getSelected() ?? "",
        options: field.getOptions(),
      });
    } else {
      result.push({ name, type: "unknown", value: "" });
    }
  }

  return result;
}

export type FormFieldValues = Record<string, string>;

/** Fill AcroForm fields and return updated PDF bytes. */
export async function fillPdfForm(
  buffer: ArrayBuffer,
  values: FormFieldValues
): Promise<Uint8Array> {
  const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
  const form = doc.getForm();

  for (const [name, value] of Object.entries(values)) {
    try {
      const field = form.getFieldMaybe(name);
      if (!field) continue;

      if (field instanceof PDFTextField) {
        field.setText(value);
      } else if (field instanceof PDFCheckBox) {
        value === "true" || value === "on" ? field.check() : field.uncheck();
      } else if (field instanceof PDFDropdown) {
        if (field.getOptions().includes(value)) field.select(value);
      } else if (field instanceof PDFOptionList) {
        if (field.getOptions().includes(value)) field.select(value);
      } else if (field instanceof PDFRadioGroup) {
        if (field.getOptions().includes(value)) field.select(value);
      }
    } catch {
      // skip fields that cannot be set
    }
  }

  form.updateFieldAppearances();
  return doc.save();
}

export interface SignatureInfo {
  fieldName: string;
  signed: boolean;
  reason?: string;
  location?: string;
  contactInfo?: string;
  note: string;
}

/**
 * Best-effort signature field detection via AcroForm.
 * True cryptographic verification is not available client-side.
 */
export async function verifyPdfSignatures(buffer: ArrayBuffer): Promise<{
  signatures: SignatureInfo[];
  disclaimer: string;
}> {
  const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
  const form = doc.getForm();
  const fields = form.getFields();
  const signatures: SignatureInfo[] = [];

  for (const field of fields) {
    const name = field.getName();
    if (field instanceof PDFSignature) {
      signatures.push({
        fieldName: name,
        signed: true,
        note: "Signature field detected. Cryptographic validation requires server-side tools.",
      });
      continue;
    }
    if (name.toLowerCase().includes("signature") || name.toLowerCase().includes("sig_")) {
      signatures.push({
        fieldName: name,
        signed: false,
        note: "Possible signature-related field found. Full verification not available in browser.",
      });
    }
  }

  return {
    signatures,
    disclaimer:
      "Browser-based signature verification is limited to detecting signature fields. " +
      "It cannot validate certificate chains, timestamps, or document integrity.",
  };
}
