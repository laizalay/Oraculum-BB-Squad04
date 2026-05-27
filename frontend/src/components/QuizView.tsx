import { useState, useEffect, useRef } from "react";
import { collection, getDocs, addDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../services/firebase";
import { useAuth } from "../context/AuthContext";
import { Check, X, ChevronRight, WifiOff, AlertTriangle } from "lucide-react";

// ── TIPOS ─────────────────────────────────────────────────────────────────────

interface Question {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  categoria: string;
}

interface QuestaoFalsa {
  id: string;
  question: string;
  options: string[];
  explanation: string;
  mensagem_erro: string;
  categoria: string;
}

interface Resultado {
  vitoria: boolean;
  classificacao: string;
}

interface QuizViewProps {
  onBack: (level?: string) => void;
}

// ── CONSTANTES ────────────────────────────────────────────────────────────────

const NIVEIS = ["junior", "pleno", "senior"] as const;
type Nivel = (typeof NIVEIS)[number];

const NIVEL_LABELS: Record<Nivel, string> = {
  junior: "Júnior",
  pleno: "Pleno",
  senior: "Sênior",
};

const STORAGE_KEY = "oraculum_quiz_progress";

function calcularProgresso(nivelIndex: number, fase: "a" | "b" | "falsa"): number {
  if (fase === "falsa") return 83;
  const etapa = nivelIndex * 2 + (fase === "b" ? 1 : 0);
  return Math.round((etapa / (NIVEIS.length * 2)) * 100);
}

// ── COMPONENTE ────────────────────────────────────────────────────────────────

export default function QuizView({ onBack }: QuizViewProps) {
  const { user } = useAuth();

  // Carrega progresso salvo
  const savedProgress = (() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (parsed.userId !== user?.uid) return null;
      return parsed;
    } catch {
      return null;
    }
  })();

  // ── Estados de nível ───────────────────────────────────────
  const [nivelAtual, setNivelAtual] = useState<number>(savedProgress?.nivelAtual ?? 0);
  const [faseAtual, setFaseAtual] = useState<"a" | "b" | "falsa">(savedProgress?.faseAtual ?? "a");
  const [tentativasA, setTentativasA] = useState<number>(savedProgress?.tentativasA ?? 3);
  const [tentativasB, setTentativasB] = useState<number>(savedProgress?.tentativasB ?? 2);
  const [acertosASenior, setAcertosASenior] = useState<number>(savedProgress?.acertosASenior ?? 0);
  const [retornoSenior, setRetornoSenior] = useState<boolean>(savedProgress?.retornoSenior ?? false);
  const [caminhoPerfeito, setCaminhoPerfeito] = useState<boolean>(savedProgress?.caminhoPerfeito ?? true);

  // ── Estados do quiz ────────────────────────────────────────
  const [questions, setQuestions] = useState<Question[]>([]);
  const [questaoFalsa, setQuestaoFalsa] = useState<QuestaoFalsa | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [reportouAnomalia, setReportouAnomalia] = useState<boolean>(false);
  const [score, setScore] = useState<number>(savedProgress?.score ?? 0);
  const [totalRespondidas, setTotalRespondidas] = useState<number>(savedProgress?.totalRespondidas ?? 0);
  const [wrongByCategory, setWrongByCategory] = useState<Record<string, number>>(savedProgress?.wrongByCategory ?? {});

  // ── Estados de UI ──────────────────────────────────────────
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [suspicious, setSuspicious] = useState<boolean>(false);
  const [showAnomaliaModal, setShowAnomaliaModal] = useState<boolean>(false);
  const [flashRed, setFlashRed] = useState<boolean>(false);
  const [showGoldFlash, setShowGoldFlash] = useState<boolean>(false);
  const lastAnswerTime = useRef<number>(Date.now());
  const suspiciousTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Salva progresso no localStorage ───────────────────────
  useEffect(() => {
    if (!user) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      userId: user.uid,
      nivelAtual,
      faseAtual,
      tentativasA,
      tentativasB,
      acertosASenior,
      retornoSenior,
      caminhoPerfeito,
      score,
      totalRespondidas,
      wrongByCategory,
    }));
  }, [nivelAtual, faseAtual, tentativasA, tentativasB, acertosASenior, retornoSenior, caminhoPerfeito, score, wrongByCategory, user]);

  // ── Limpa progresso ao finalizar ──────────────────────────
  function limparProgresso() {
    localStorage.removeItem(STORAGE_KEY);
  }

  // ── Aviso ao sair ──────────────────────────────────────────
  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      e.preventDefault();
      e.returnValue = "";
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  // ── Detecção de conexão ────────────────────────────────────
  useEffect(() => {
    const handleOffline = () => setIsOffline(true);
    const handleOnline = () => setIsOffline(false);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);
    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  // ── Busca perguntas do Firebase ────────────────────────────
  useEffect(() => {
    async function buscar() {
      setLoading(true);
      setCurrentIndex(0);
      setSelectedOption(null);
      setReportouAnomalia(false);

      if (faseAtual === "falsa") {
        try {
          const snap = await getDocs(collection(db, "bonus_questions"));
          const lista = snap.docs.map((d) => ({ id: d.id, ...d.data() } as QuestaoFalsa));
          if (lista.length > 0) {
            setQuestaoFalsa(lista[Math.floor(Math.random() * lista.length)]);
          }
        } catch (err) {
          console.error("Erro ao buscar questão falsa:", err);
        } finally {
          setLoading(false);
        }
        return;
      }

      const nivel = NIVEIS[nivelAtual];
      const caminho = `${nivel}_${faseAtual}`;
      const ref = collection(db, "perguntas", caminho, "questoes");

      try {
        const snapshot = await getDocs(ref);
        const dados = snapshot.docs.map((d) => d.data() as Question);
        const embaralhadas = [...dados].sort(() => Math.random() - 0.5);
        setQuestions(embaralhadas);
      } catch {
        setQuestions([]);
      } finally {
        setLoading(false);
      }
    }

    buscar();
  }, [nivelAtual, faseAtual]);

  // ── Salva resultado no Firestore ───────────────────────────
  async function salvarResultado(res: Resultado) {
    limparProgresso();
    if (!user) { onBack(); return; }
    try {
      await addDoc(collection(db, "quiz_attempts"), {
        user_id: user.uid,
        quiz_type: "leveling",
        score,
        total_questions: totalRespondidas,
        completed_at: new Date().toISOString(),
        wrong_by_category: wrongByCategory,
      });
      await updateDoc(doc(db, "users", user.uid), {
        level: res.classificacao.toLowerCase(),
        leveling_completed: true,
      });
    } catch (err) {
      console.error("Erro ao salvar resultado:", err);
    } finally {
      onBack(res.classificacao.toLowerCase());
    }
  }

  // ── Clique em "Sinalizar Anomalia" ────────────────────────
  function handleSinalizarAnomalia() {
    if (faseAtual === "falsa" && !reportouAnomalia && selectedOption === null) {
      setReportouAnomalia(true);
      setShowGoldFlash(true);
      setTimeout(() => setShowGoldFlash(false), 1500);
    } else if (faseAtual !== "falsa") {
      setShowAnomaliaModal(true);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // LÓGICA CENTRAL DE NIVELAMENTO A/B + QUESTÃO FALSA
  // ─────────────────────────────────────────────────────────────────────────
  function processarResposta(acertou: boolean) {
    const nomeNivel = NIVEIS[nivelAtual];

    if (!acertou) setCaminhoPerfeito(false);

    if (faseAtual === "a") {

      if (nomeNivel === "senior" && retornoSenior) {
        const novasTentativas = tentativasA - 1;
        setTentativasA(novasTentativas);

        const novosAcertos = acertosASenior + (acertou ? 1 : 0);
        if (acertou) {
          setAcertosASenior(novosAcertos);
          setScore((s) => s + 1);
        }

        if (novosAcertos >= 2) {
          salvarResultado({ vitoria: true, classificacao: "senior" });
          return;
        }

        if (novasTentativas <= 0 && novosAcertos < 2) {
          salvarResultado({ vitoria: false, classificacao: "pleno" });
          return;
        }

      } else {
        const novasTentativas = tentativasA - 1;
        setTentativasA(novasTentativas);

        if (acertou) {
          setScore((s) => s + 1);
          if (nomeNivel === "senior") setAcertosASenior((a) => a + 1);

          if (nomeNivel === "senior" && caminhoPerfeito) {
            setFaseAtual("falsa");
          } else {
            setFaseAtual("b");
          }
          return;
        } else {
          if (novasTentativas <= 0) {
            const classificacao = nivelAtual === 0 ? "junior" : NIVEIS[nivelAtual - 1];
            salvarResultado({ vitoria: false, classificacao });
            return;
          }
        }
      }

    } else if (faseAtual === "b") {
      const novasTentativas = tentativasB - 1;
      setTentativasB(novasTentativas);

      if (acertou) {
        setScore((s) => s + 1);

        if (nivelAtual + 1 >= NIVEIS.length) {
          salvarResultado({ vitoria: true, classificacao: "senior" });
        } else {
          setNivelAtual((n) => n + 1);
          setFaseAtual("a");
          setTentativasA(3);
          setTentativasB(2);
          setAcertosASenior(0);
          setRetornoSenior(false);
        }
        return;
      } else {
        if (novasTentativas <= 0) {
          if (nomeNivel === "senior" && tentativasA > 0) {
            setFaseAtual("a");
            setTentativasB(2);
            setRetornoSenior(true);
            return;
          }

          const classificacao = nivelAtual === 0 ? "junior" : NIVEIS[nivelAtual - 1];
          salvarResultado({ vitoria: false, classificacao });
          return;
        }
      }
    }

    setCurrentIndex((i) => (i + 1 < questions.length ? i + 1 : 0));
    setSelectedOption(null);
    setReportouAnomalia(false);
  }

  // ── Processamento da questão falsa ─────────────────────────
  function processarQuestaoFalsa(errouAlternativa: boolean) {
    if (errouAlternativa) {
      setFlashRed(true);
      setTimeout(() => setFlashRed(false), 1000);
      setFaseAtual("a");
      setRetornoSenior(true);
      setSelectedOption(null);
      setReportouAnomalia(false);
    } else {
      salvarResultado({ vitoria: true, classificacao: "senior+" });
    }
  }

  // ── Clique numa alternativa ────────────────────────────────
  function handleSelect(index: number) {
    if (selectedOption !== null || reportouAnomalia) return;

    const now = Date.now();
    if (now - lastAnswerTime.current < 3000) {
      setSuspicious(true);
      if (suspiciousTimer.current) clearTimeout(suspiciousTimer.current);
      suspiciousTimer.current = setTimeout(() => setSuspicious(false), 5000);
    }
    lastAnswerTime.current = now;

    setSelectedOption(index);
    setTotalRespondidas((t) => t + 1);

    if (faseAtual === "falsa" && questaoFalsa) {
      setFlashRed(true);
      setTimeout(() => setFlashRed(false), 800);
      setWrongByCategory((prev) => ({
        ...prev,
        [questaoFalsa.categoria]: (prev[questaoFalsa.categoria] ?? 0) + 1,
      }));
    } else {
      if (questions[currentIndex]) {
        const q = questions[currentIndex];
        const acertou = index === q.correctIndex;
        if (!acertou) {
          setWrongByCategory((prev) => ({
            ...prev,
            [q.categoria]: (prev[q.categoria] ?? 0) + 1,
          }));
        }
      }
    }
  }

  // ── Próxima pergunta ───────────────────────────────────────
  function handleNext() {
    if (faseAtual === "falsa") {
      if (reportouAnomalia) {
        processarQuestaoFalsa(false);
      } else if (selectedOption !== null) {
        processarQuestaoFalsa(true);
      }
      return;
    }

    if (selectedOption === null) return;
    const acertou = selectedOption === questions[currentIndex].correctIndex;
    processarResposta(acertou);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // LOADING
  // ─────────────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Carregando perguntas...</p>
      </div>
    );
  }

  if (faseAtual !== "falsa" && questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Nenhuma pergunta encontrada.</p>
      </div>
    );
  }

  if (faseAtual === "falsa" && !questaoFalsa) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Carregando questão especial...</p>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // TELA DO QUIZ
  // ─────────────────────────────────────────────────────────────────────────
  const isFalsa = faseAtual === "falsa";
  const currentQuestion = isFalsa ? questaoFalsa! : questions[currentIndex];
  const nomeNivel = NIVEIS[nivelAtual];
  const progressPct = calcularProgresso(nivelAtual, faseAtual);

  const falsaErrou = isFalsa && selectedOption !== null && !reportouAnomalia;
  const falsaAcertou = isFalsa && reportouAnomalia;
  const falsaResolvida = falsaErrou || falsaAcertou;

  return (
    <div className={`min-h-screen transition-colors duration-300 ${flashRed ? "bg-red-200" : showGoldFlash ? "bg-yellow-100" : "bg-gray-50"}`}>

      {/* Modal "Nenhuma anomalia" */}
      {showAnomaliaModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center shadow-xl">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
              <Check className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-bold text-gray-800 mb-2">Nenhuma anomalia detectada</h3>
            <p className="text-sm text-gray-500 mb-4">Esta é uma questão legítima. Continue respondendo normalmente.</p>
            <button
              onClick={() => setShowAnomaliaModal(false)}
              className="w-full bg-[#F5C518] text-[#1F3864] font-bold py-2.5 rounded-lg hover:bg-yellow-400 transition"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-[#1F3864] px-4 py-4">
        <div className="max-w-lg mx-auto">
          <h1 className="text-lg font-bold text-white">Quiz</h1>
          <p className="text-xs text-white/70">Progresso: {progressPct}%</p>
          <div className="w-full h-1.5 bg-white/20 rounded-full mt-2">
            <div
              className="h-full bg-[#F5C518] rounded-full transition-all duration-700"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </header>

      {/* Banner offline */}
      {isOffline && (
        <div className="bg-red-500 text-white text-center py-2 px-4 text-sm font-semibold flex items-center justify-center gap-2">
          <WifiOff className="w-4 h-4" />
          Você está sem conexão. Suas respostas estão salvas localmente.
        </div>
      )}

      {/* Banner velocidade suspeita */}
      {suspicious && (
        <div className="bg-amber-500 text-white text-center py-2 px-4 text-sm font-semibold">
          ⚠️ Você está respondendo muito rápido! O resultado pode não refletir seu conhecimento real.
        </div>
      )}

      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Card da pergunta */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-4 relative">
          <span className="text-xs font-semibold px-2 py-1 rounded-full bg-gray-100 text-gray-500 mb-3 inline-block uppercase tracking-wide">
            {NIVEL_LABELS[nomeNivel]}
          </span>
          <h2 className="text-lg font-semibold text-gray-800 leading-relaxed">
            {currentQuestion.question}
          </h2>

          {/* Botão Sinalizar Anomalia */}
          <button
            onClick={handleSinalizarAnomalia}
            disabled={falsaResolvida}
            className={`mt-4 flex items-center gap-1.5 text-xs transition text-gray-300 hover:text-gray-400
              ${falsaResolvida ? "cursor-default opacity-50" : "cursor-pointer"}
            `}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Sinalizar Anomalia</span>
          </button>
        </div>

        {/* Feedback — acertou questão falsa */}
        {falsaAcertou && (
          <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-4 mb-4">
            <p className="text-sm text-yellow-800 font-semibold mb-1">
              🌟 Brilhante! Você identificou a armadilha.
            </p>
            <p className="text-sm text-yellow-700">
              Em cibersegurança, a melhor resposta às vezes é não clicar em nada e reportar o incidente. Você acaba de garantir o nível <b>Sênior+</b>!
            </p>
          </div>
        )}

        {/* Feedback — errou questão falsa */}
        {falsaErrou && questaoFalsa && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
            <p className="text-sm text-red-700 font-semibold mb-2">
              🎣 {questaoFalsa.mensagem_erro}
            </p>
            <p className="text-sm text-red-600">
              {questaoFalsa.explanation}
            </p>
          </div>
        )}

        {/* Alternativas */}
        {!falsaAcertou && (
          <div className="space-y-3 mb-4">
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedOption === index;
              const isCorrect = !isFalsa && index === (currentQuestion as Question).correctIndex;
              const revealed = selectedOption !== null || reportouAnomalia;

              let borderColor = "border-gray-200";
              let bgColor = "bg-white";

              if (revealed) {
                if (!isFalsa && isCorrect) {
                  borderColor = "border-green-500";
                  bgColor = "bg-green-50";
                } else if (isSelected) {
                  borderColor = "border-red-500";
                  bgColor = "bg-red-50";
                }
              }

              const opacity = revealed && !isSelected && (isFalsa || !isCorrect) ? "opacity-45" : "";

              return (
                <button
                  key={index}
                  onClick={() => handleSelect(index)}
                  disabled={revealed}
                  className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left
                    ${borderColor} ${bgColor} ${opacity}
                    ${!revealed ? "hover:border-[#1F3864] cursor-pointer" : "cursor-default"}
                  `}
                >
                  <span className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-semibold text-gray-600 flex-shrink-0">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span className="flex-1 text-sm text-gray-800">{option}</span>
                  {revealed && !isFalsa && isCorrect && (
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                  )}
                  {revealed && isSelected && (isFalsa || !isCorrect) && (
                    <X className="w-5 h-5 text-red-500 flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Explicação — questões normais */}
        {!isFalsa && selectedOption !== null && (currentQuestion as Question).explanation && (
          <div className="bg-gray-50 rounded-xl p-4 mb-4">
            <p className="text-sm text-gray-500">
              <strong className="text-gray-800">Explicação:</strong> {(currentQuestion as Question).explanation}
            </p>
          </div>
        )}

        {/* Botão próxima */}
        {(selectedOption !== null || falsaAcertou) && (
          <button
            onClick={handleNext}
            className="w-full h-12 bg-[#F5C518] text-[#1F3864] font-bold rounded-lg hover:bg-yellow-400 transition flex items-center justify-center gap-2"
          >
            <span>{falsaAcertou ? "Ver resultado" : falsaErrou ? "Continuar" : "Próxima"}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}