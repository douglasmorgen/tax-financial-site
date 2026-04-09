"use client";

import { useMemo, useState } from "react";
import { DocumentCategory } from "@prisma/client";
import { doesReturnTypeRequireState, FINISHED_RETURN_TYPES, US_STATE_OPTIONS } from "@/lib/document-options";

type AdminReturnUploadFormProps = {
  clients: Array<{
    id: string;
    name: string;
    email: string;
  }>;
  taxYearChoices: number[];
  selectedTaxYear: number;
};

export function AdminReturnUploadForm({ clients, taxYearChoices, selectedTaxYear }: AdminReturnUploadFormProps) {
  const [returnType, setReturnType] = useState<string>(FINISHED_RETURN_TYPES[0]);
  const requiresState = useMemo(() => doesReturnTypeRequireState(returnType), [returnType]);

  return (
    <form
      action="/api/admin/documents"
      method="post"
      encType="multipart/form-data"
      className="mt-6 space-y-4"
    >
      <label className="space-y-2 text-sm font-medium text-slate-700">
        <span>Client</span>
        <select
          name="clientId"
          required
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none ring-0 transition focus:border-slate-400"
        >
          <option value="">Select a client</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.name} ({client.email})
            </option>
          ))}
        </select>
      </label>
      <label className="space-y-2 text-sm font-medium text-slate-700">
        <span>Tax year</span>
        <select
          name="taxYear"
          required
          defaultValue={selectedTaxYear}
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none ring-0 transition focus:border-slate-400"
        >
          {taxYearChoices.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </label>
      <label className="space-y-2 text-sm font-medium text-slate-700">
        <span>Return type</span>
        <select
          name="returnType"
          required
          value={returnType}
          onChange={(event) => setReturnType(event.target.value)}
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none ring-0 transition focus:border-slate-400"
        >
          {FINISHED_RETURN_TYPES.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>
      {requiresState ? (
        <label className="space-y-2 text-sm font-medium text-slate-700">
          <span>State</span>
          <select
            name="stateCode"
            required
            defaultValue=""
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none ring-0 transition focus:border-slate-400"
          >
            <option value="">Select state</option>
            {US_STATE_OPTIONS.map((state) => (
              <option key={state.code} value={state.code}>
                {state.name}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      <input type="hidden" name="category" value={DocumentCategory.COMPLETED_RETURN} />
      <label className="space-y-2 text-sm font-medium text-slate-700">
        <span>Return file</span>
        <input
          name="file"
          type="file"
          required
          className="w-full rounded-2xl border border-dashed border-slate-300 px-4 py-3 text-sm"
        />
      </label>
      <button
        type="submit"
        className="w-full rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500"
      >
        Upload Return
      </button>
    </form>
  );
}
