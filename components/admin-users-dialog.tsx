"use client";

import { Trash2Icon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "./toast";

type AdminUser = {
  id: string;
  email: string;
  role: string;
};

export function AdminUsersDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);

  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState("regular");

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        setUsers(await res.json());
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      fetchUsers();
    }
  }, [open, fetchUsers]);

  const handleCreate = async () => {
    if (!newEmail || !newPassword) {
      toast({ type: "error", description: "Email e senha sao obrigatorios" });
      return;
    }

    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: newEmail,
        password: newPassword,
        role: newRole,
      }),
    });

    if (res.ok) {
      toast({ type: "success", description: "Usuario criado" });
      setNewEmail("");
      setNewPassword("");
      setNewRole("regular");
      setShowCreateForm(false);
      fetchUsers();
    } else {
      const data = await res.json();
      toast({
        type: "error",
        description: data.message ?? "Erro ao criar usuario",
      });
    }
  };

  const handleRoleChange = async (userId: string, role: string) => {
    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: userId, role }),
    });

    if (res.ok) {
      toast({ type: "success", description: "Role atualizada" });
      fetchUsers();
    } else {
      toast({ type: "error", description: "Erro ao atualizar role" });
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    const res = await fetch("/api/admin/users", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: deleteTarget.id }),
    });

    if (res.ok) {
      toast({ type: "success", description: "Usuario deletado" });
      setDeleteTarget(null);
      fetchUsers();
    } else {
      const data = await res.json();
      toast({
        type: "error",
        description: data.message ?? "Erro ao deletar usuario",
      });
      setDeleteTarget(null);
    }
  };

  return (
    <>
      <Dialog onOpenChange={onOpenChange} open={open}>
        <DialogContent className="max-h-[80vh] max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Gerenciar Usuarios</DialogTitle>
            <DialogDescription>
              Crie, edite roles e delete usuarios do sistema.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            {!showCreateForm ? (
              <Button
                className="w-fit"
                onClick={() => setShowCreateForm(true)}
                type="button"
                variant="outline"
              >
                + Novo Usuario
              </Button>
            ) : (
              <div className="flex flex-col gap-3 rounded-lg border p-4">
                <p className="font-medium text-sm">Novo Usuario</p>
                <Input
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="Email"
                  type="email"
                  value={newEmail}
                />
                <Input
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Senha"
                  type="password"
                  value={newPassword}
                />
                <Select onValueChange={setNewRole} value={newRole}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="regular">Regular</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex gap-2">
                  <Button onClick={handleCreate} type="button">
                    Criar
                  </Button>
                  <Button
                    onClick={() => setShowCreateForm(false)}
                    type="button"
                    variant="ghost"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            )}

            {loading ? (
              <p className="text-muted-foreground text-sm">Carregando...</p>
            ) : (
              <div className="flex flex-col gap-2">
                {users.map((u) => (
                  <div
                    className="flex items-center justify-between gap-2 rounded-lg border px-3 py-2"
                    key={u.id}
                  >
                    <span className="min-w-0 flex-1 truncate text-sm">
                      {u.email}
                    </span>
                    <Select
                      onValueChange={(role) => handleRoleChange(u.id, role)}
                      value={u.role}
                    >
                      <SelectTrigger className="w-28">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="regular">Regular</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      onClick={() => setDeleteTarget(u)}
                      size="icon"
                      type="button"
                      variant="ghost"
                    >
                      <Trash2Icon className="size-4 text-destructive" />
                    </Button>
                  </div>
                ))}
                {users.length === 0 && (
                  <p className="text-muted-foreground text-sm">
                    Nenhum usuario encontrado.
                  </p>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog
        onOpenChange={(v) => {
          if (!v) setDeleteTarget(null);
        }}
        open={Boolean(deleteTarget)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deletar usuario?</AlertDialogTitle>
            <AlertDialogDescription>
              Isso ira deletar permanentemente o usuario{" "}
              <strong>{deleteTarget?.email}</strong> e todos os seus chats e
              documentos. Essa acao nao pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Deletar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
