"use client";

import { CheckCircleIcon, EyeIcon, EyeOffIcon, KeyIcon, Trash2Icon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ProviderInfo = {
  provider: string;
  maskedKey: string;
};

export function ApiKeysDialog({
  open,
  onOpenChange,
  dismissable = true,
  onKeysChanged,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dismissable?: boolean;
  onKeysChanged?: () => void;
}) {
  const [configured, setConfigured] = useState<ProviderInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [inputValue, setInputValue] = useState("");
  const [showValue, setShowValue] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchKeys = useCallback(async () => {
    try {
      const res = await fetch("/api/user/api-keys");
      if (res.ok) {
        const data: ProviderInfo[] = await res.json();
        const anthropicKey = data.find((d) => d.provider === "anthropic");
        setConfigured(anthropicKey ?? null);
      }
    } catch (_error) {
      toast.error("Erro ao carregar chave");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      fetchKeys();
      setInputValue("");
      setShowValue(false);
    }
  }, [open, fetchKeys]);

  const hasKey = configured !== null;

  const handleSave = async () => {
    if (!inputValue.trim()) {
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/user/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: "anthropic", apiKey: inputValue.trim() }),
      });

      if (res.ok) {
        toast.success("Chave Anthropic salva");
        setInputValue("");
        await fetchKeys();
        onKeysChanged?.();
      } else {
        const data = await res.json();
        toast.error(data.message ?? "Erro ao salvar chave");
      }
    } catch (_error) {
      toast.error("Erro ao salvar chave");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!dismissable) {
      toast.error("Você precisa ter a chave configurada para usar o sistema");
      return;
    }

    try {
      const res = await fetch("/api/user/api-keys", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: "anthropic" }),
      });

      if (res.ok) {
        toast.success("Chave removida");
        await fetchKeys();
        onKeysChanged?.();
      }
    } catch (_error) {
      toast.error("Erro ao remover chave");
    }
  };

  return (
    <Dialog
      onOpenChange={dismissable || hasKey ? onOpenChange : undefined}
      open={open}
    >
      <DialogContent
        className="sm:max-w-md"
        hideCloseButton={!dismissable && !hasKey}
        onPointerDownOutside={
          !dismissable && !hasKey ? (e) => e.preventDefault() : undefined
        }
        onEscapeKeyDown={
          !dismissable && !hasKey ? (e) => e.preventDefault() : undefined
        }
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyIcon className="size-5" />
            Configurar API Key
          </DialogTitle>
          <DialogDescription>
            Configure sua chave da Anthropic para usar o Claude Sonnet 4.5.
            Sua chave é armazenada de forma segura (criptografada).
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="size-6 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
          </div>
        ) : (
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2 text-sm font-medium">
                  Anthropic
                  {hasKey && (
                    <CheckCircleIcon className="size-4 text-emerald-500" />
                  )}
                </Label>
                <a
                  className="text-xs text-muted-foreground hover:text-foreground"
                  href="https://console.anthropic.com/settings/keys"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  Obter chave
                </a>
              </div>

              {hasKey && configured.maskedKey ? (
                <div className="flex items-center gap-2">
                  <div className="flex-1 rounded-md border bg-muted/50 px-3 py-2 font-mono text-sm text-muted-foreground">
                    {configured.maskedKey}
                  </div>
                  {dismissable && (
                    <Button
                      onClick={handleDelete}
                      size="icon"
                      type="button"
                      variant="ghost"
                    >
                      <Trash2Icon className="size-4 text-destructive" />
                    </Button>
                  )}
                </div>
              ) : null}

              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Input
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSave();
                      }
                    }}
                    placeholder={hasKey ? "Substituir chave..." : "sk-ant-..."}
                    type={showValue ? "text" : "password"}
                    value={inputValue}
                  />
                  <button
                    className="absolute top-1/2 right-2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowValue((prev) => !prev)}
                    type="button"
                  >
                    {showValue ? (
                      <EyeOffIcon className="size-4" />
                    ) : (
                      <EyeIcon className="size-4" />
                    )}
                  </button>
                </div>
                <Button
                  disabled={!inputValue.trim() || saving}
                  onClick={handleSave}
                  size="sm"
                  type="button"
                >
                  {saving ? "Salvando..." : "Salvar"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
