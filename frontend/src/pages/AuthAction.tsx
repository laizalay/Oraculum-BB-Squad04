// =====================================================
// src/pages/AuthAction.tsx
// Página intermediária para ações do Firebase por e-mail
//
// O Firebase redireciona todos os links de e-mail para cá.
// Esta página lê o parâmetro "mode" da URL e redireciona
// para a tela correta automaticamente.
//
// Modos possíveis:
// - resetPassword  → /reset-password (redefinir senha)
// - verifyEmail    → / (verificação de e-mail)
// - recoverEmail   → /login (recuperar e-mail)
// =====================================================

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Shield } from "lucide-react";

export default function AuthAction() {
  const navigate = useNavigate();

  useEffect(() => {
    // Lê os parâmetros da URL enviada pelo Firebase
    const params = new URLSearchParams(window.location.search);
    const mode = params.get("mode");
    const oobCode = params.get("oobCode");

    // Monta a query string para passar o token adiante
    const query = oobCode ? `?oobCode=${oobCode}` : "";

    // Redireciona para a tela correta baseado no modo
    if (mode === "resetPassword") {
      // Redefinição de senha
      navigate(`/reset-password${query}`, { replace: true });

    } else if (mode === "verifyEmail") {
      // Verificação de e-mail — redireciona para home
      navigate(`/${query}`, { replace: true });

    } else if (mode === "recoverEmail") {
      // Recuperação de e-mail — redireciona para login
      navigate(`/login`, { replace: true });

    } else {
      // Modo desconhecido — redireciona para login por segurança
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  // Tela de carregamento enquanto redireciona
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1F3864]">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-[#F5C518] mx-auto mb-4 flex items-center justify-center">
          <Shield className="w-8 h-8 text-[#1F3864]" />
        </div>
        <p className="text-white/70">Redirecionando...</p>
      </div>
    </div>
  );
}
