"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  Check,
  CheckCircle2,
  Clipboard,
  Clock3,
  Copy,
  Info,
  Loader2,
} from "lucide-react";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/PageHeader";

type PaymentBilling = {
  pix?: {
    payload?: string;
  };
};

type Listing = {
  status?: string;
};

type BillingState = {
  chargeId: string | null;
  pixKey: string;
  error: string;
};

function getParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default function PaymentPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const chargeId = getParam(params.chargeId);
  const listingId = searchParams.get("listingId");

  const [billingState, setBillingState] = useState<BillingState>({
    chargeId: null,
    pixKey: "",
    error: "",
  });
  const [confirmed, setConfirmed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState("");

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!chargeId) return;
    api.get<PaymentBilling>(`/api/payments/${chargeId}`)
      .then((billing) => {
        setBillingState({ chargeId, pixKey: billing?.pix?.payload ?? "", error: "" });
      })
      .catch((err) => {
        setBillingState({
          chargeId,
          pixKey: "",
          error: (err as Error).message || "Não foi possível carregar a chave PIX.",
        });
      });
  }, [chargeId]);

  useEffect(() => {
    if (!listingId || confirmed) return;

    intervalRef.current = setInterval(async () => {
      try {
        const listing = await api.get<Listing>(`/api/listings/${listingId}`);
        if (listing?.status === "SOLD") {
          setConfirmed(true);
          if (intervalRef.current) clearInterval(intervalRef.current);
        }
      } catch {
        // Keep polling; transient API failures should not kick the buyer out.
      }
    }, 4000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [listingId, confirmed]);

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    };
  }, []);

  const pixKey = chargeId && billingState.chargeId === chargeId ? billingState.pixKey : "";
  const billingError = chargeId && billingState.chargeId === chargeId ? billingState.error : "";
  const loadingPix = Boolean(chargeId && billingState.chargeId !== chargeId);

  const handleCopy = async () => {
    if (!pixKey) return;
    try {
      await navigator.clipboard.writeText(pixKey);
      setCopied(true);
      setCopyError("");
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopyError("Não foi possível copiar automaticamente. Selecione a chave PIX manualmente.");
    }
  };

  if (confirmed) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F0EBDD] px-4">
        <section className="flex w-full max-w-md flex-col items-center rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
          <CheckCircle2 className="h-20 w-20 text-agre-brand" />
          <h1 className="mt-4 font-display text-2xl font-extrabold text-agre-dark">Pagamento confirmado!</h1>
          <p className="mt-2 text-sm leading-6 text-agre-muted">
            Sua compra foi realizada com sucesso. O vendedor será notificado.
          </p>
          <button
            type="button"
            onClick={() => router.replace("/feed")}
            className="mt-6 h-12 rounded-xl bg-agre-button px-8 text-sm font-extrabold text-white hover:bg-agre-dark"
          >
            Voltar ao feed
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F0EBDD]">
      <PageHeader title="Pagamento via PIX" onBack={() => router.back()} />

      <div className="mx-auto max-w-2xl px-4 py-5">
        <section className="mb-4 flex items-start gap-3 rounded-2xl bg-agre-pale p-4">
          <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-agre-button" />
          <p className="text-sm leading-6 text-agre-muted">
            Copie a chave PIX abaixo e pague pelo app do seu banco. O pagamento é confirmado automaticamente.
          </p>
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-agre-muted">Chave PIX</p>
              <h2 className="font-display text-lg font-extrabold text-agre-dark">Copia e cola</h2>
            </div>
            <Clipboard className="h-6 w-6 text-agre-button" />
          </div>

          <div className="min-h-28 rounded-xl border border-zinc-200 bg-zinc-50 p-4">
            {loadingPix ? (
              <div className="flex h-20 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-agre-button" />
              </div>
            ) : (
              <p className="break-all text-sm leading-6 text-zinc-800">
                {pixKey || "—"}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={handleCopy}
            disabled={!pixKey || loadingPix}
            className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-agre-button text-sm font-extrabold text-white hover:bg-agre-dark disabled:cursor-not-allowed disabled:bg-zinc-300"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copiado!" : "Copiar chave"}
          </button>

          {(billingError || copyError) && (
            <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600">
              {billingError || copyError}
            </p>
          )}
        </section>

        <section className="mt-4 flex items-center justify-center gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
          <Loader2 className="h-5 w-5 animate-spin text-agre-button" />
          <p className="text-sm font-semibold text-agre-muted">
            Aguardando confirmação do pagamento...
          </p>
        </section>

        <p className="mt-4 flex items-start justify-center gap-2 text-center text-xs leading-5 text-zinc-400">
          <Clock3 className="mt-0.5 h-4 w-4 flex-shrink-0" />
          Não feche esta tela. Assim que o pagamento for confirmado, você será avisado automaticamente.
        </p>
      </div>
    </main>
  );
}
