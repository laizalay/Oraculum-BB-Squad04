// =====================================================
// src/pages/ResetPassword.tsx
// Tela de Redefinição de Senha — Oraculum BB
// Responsáveis: Felipe Bento & João Guilherme (US04)
//
// Fluxo:
// 1. Usuário clica no link recebido por e-mail
// 2. Firebase valida o token automaticamente via URL
// 3. Usuário define a nova senha
// 4. Redirecionado para o login após sucesso
// =====================================================

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAuth, confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth";
import { Eye, EyeOff } from "lucide-react";

export default function ResetPassword() {
  const navigate = useNavigate();
  const auth = getAuth();

  const [password, setPassword]           = useState("");
  const [confirmPassword, setConfirm]     = useState("");
  const [showPassword, setShowPassword]   = useState(false);
  const [showConfirm, setShowConfirm]     = useState(false);
  const [message, setMessage]             = useState("");
  const [error, setError]                 = useState("");
  const [loading, setLoading]             = useState(false);

  // Pega o token (oobCode) da URL enviada pelo Firebase por e-mail
  // Exemplo de URL: /reset-password?oobCode=ABC123
  const oobCode = new URLSearchParams(window.location.search).get("oobCode");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");

    // Validação: senha com mínimo de 8 caracteres (critério de aceite US04)
    if (password.length < 8) {
      setError("A senha deve ter pelo menos 8 caracteres.");
      return;
    }

    // Validação: os dois campos precisam ser iguais
    if (password !== confirmPassword) {
      setError("As senhas não coincidem. Verifique e tente novamente.");
      return;
    }

    // Validação: token da URL precisa existir
    if (!oobCode) {
      setError("Link inválido ou expirado. Solicite um novo link de recuperação.");
      return;
    }

    setLoading(true);

    try {
      // Verifica se o token ainda é válido antes de tentar redefinir
      await verifyPasswordResetCode(auth, oobCode);

      // Redefine a senha com o token e a nova senha informada
      await confirmPasswordReset(auth, oobCode, password);

      setMessage("Senha redefinida com sucesso! Redirecionando para o login...");

      // Aguarda 2 segundos e redireciona para o login
      setTimeout(() => navigate("/login"), 2000);

    } catch (err: any) {
      // Trata os erros mais comuns do Firebase
      if (err.code === "auth/expired-action-code") {
        setError("Este link expirou. Solicite um novo link de recuperação.");
      } else if (err.code === "auth/invalid-action-code") {
        setError("Link inválido ou já utilizado. Solicite um novo link de recuperação.");
      } else if (err.code === "auth/weak-password") {
        setError("Senha muito fraca. Use pelo menos 8 caracteres com letras e números.");
      } else {
        setError("Não foi possível redefinir a senha. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#1F3864] px-4">
      <div className="w-full max-w-sm">

        {/* Cabeçalho com logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="bg-[#F5C518] rounded-full p-4 mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#1F3864]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h1 className="text-white text-2xl font-bold">Oraculum BB</h1>
          <p className="text-white/70 text-sm">Redefinir senha</p>
        </div>

        {/* Card principal */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h2 className="text-[#1F3864] font-semibold text-lg mb-1">Nova Senha</h2>
          <p className="text-gray-500 text-sm mb-4">
            Escolha uma senha forte para proteger sua conta.
          </p>

          {/* Mensagem de sucesso */}
          {message && (
            <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg p-3 mb-4">
              {message}
            </div>
          )}

          {/* Mensagem de erro */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mb-4">
              {error}
            </div>
          )}

          {/* Formulário — só exibe se não tiver sucesso ainda */}
          {!message && (
            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Campo nova senha */}
              <div>
                <label className="text-sm text-gray-600 mb-1 block">
                  Nova Senha
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Mínimo 8 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1F3864] pr-10"
                  />
                  {/* Botão mostrar/ocultar senha */}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Campo confirmar senha */}
              <div>
                <label className="text-sm text-gray-600 mb-1 block">
                  Confirmar Nova Senha
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    placeholder="Repita a senha"
                    value={confirmPassword}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1F3864] pr-10"
                  />
                  {/* Botão mostrar/ocultar confirmação */}
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Botão de redefinir */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#F5C518] text-[#1F3864] font-bold py-2.5 rounded-lg hover:bg-yellow-400 transition disabled:opacity-50"
              >
                {loading ? "Redefinindo..." : "Redefinir Senha"}
              </button>

            </form>
          )}

          {/* Link de voltar ao login */}
          <p className="text-center text-sm text-gray-500 mt-4">
            <Link to="/login" className="text-[#1F3864] font-semibold hover:underline">
              Voltar ao login
            </Link>
          </p>
        </div>

        {/* Rodapé */}
        <p className="text-center text-white/50 text-xs mt-6">
          Patrocinado pelo Banco do Brasil
        </p>

      </div>
    </div>
  );
}
