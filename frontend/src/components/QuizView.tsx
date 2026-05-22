import { useState, useEffect, useRef } from "react";
import { collection, getDocs, addDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../services/firebase";
import { useAuth } from "../context/AuthContext";
import { Check, X, ChevronRight, WifiOff } from "lucide-react";

// ── TIPOS ─────────────────────────────────────────────────────────────────────

interface Question {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  categoria: string;
}

interface Resultado {
  vitoria: boolean;
  classificacao: string;
}

interface QuizViewProps {
  onBack: () => void;
}

// ── CONSTANTES ────────────────────────────────────────────────────────────────

const NIVEIS = ["junior", "pleno", "senior"] as const;
type Nivel = (typeof NIVEIS)[number];

const NIVEL_LABELS: Record<Nivel, string> = {
  junior: "Júnior",
  pleno: "Pleno",
  senior: "Sênior",
};

function calcularProgresso(nivelIndex: number, fase: "a" | "b"): number {
  const etapa = nivelIndex * 2 + (fase === "b" ? 1 : 0);
  return Math.round((etapa / (NIVEIS.length * 2)) * 100);
}

// ── COMPONENTE ────────────────────────────────────────────────────────────────

export default function QuizView({ onBack }: QuizViewProps) {
  const { user } = useAuth();

  // ── Estados de nível ───────────────────────────────────────
  const [nivelAtual, setNivelAtual] = useState<number>(0);
  const [faseAtual, setFaseAtual] = useState<"a" | "b">("a");
  const [tentativasA, setTentativasA] = useState<number>(3);
  const [tentativasB, setTentativasB] = useState<number>(2);
  const [acertosASenior, setAcertosASenior] = useState<number>(0);
  const [retornoSenior, setRetornoSenior] = useState<boolean>(false);

  // ── Estados do quiz ────────────────────────────────────────
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState<number>(0);
  const [wrongByCategory, setWrongByCategory] = useState<Record<string, number>>({});

  // ── Estados de UI ──────────────────────────────────────────
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [suspicious, setSuspicious] = useState<boolean>(false);
  const lastAnswerTime = useRef<number>(Date.now());
  const suspiciousTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    async function buscarPerguntas() {
      setLoading(true);
      setCurrentIndex(0);
      setSelectedOption(null);

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

    buscarPerguntas();
  }, [nivelAtual, faseAtual]);

  // ── Salva resultado no Firestore e chama onBack ────────────
  async function salvarResultado(res: Resultado) {
    if (!user) { onBack(); return; }
    try {
      await addDoc(collection(db, "quiz_attempts"), {
        user_id: user.uid,
        quiz_type: "leveling",
        score,
        total_questions: questions.length,
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
      onBack();
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // LÓGICA CENTRAL DE NIVELAMENTO A/B
  // ─────────────────────────────────────────────────────────────────────────
  function processarResposta(acertou: boolean) {
    const nomeNivel = NIVEIS[nivelAtual];

    // ── FASE A ─────────────────────────────────────────────
    if (faseAtual === "a") {

      // Regra especial: voltou da B para A no Senior
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
        // Fluxo normal da Fase A
        const novasTentativas = tentativasA - 1;
        setTentativasA(novasTentativas);

        if (acertou) {
          setScore((s) => s + 1);
          if (nomeNivel === "senior") setAcertosASenior((a) => a + 1);
          setFaseAtual("b");
          return;
        } else {
          if (novasTentativas <= 0) {
            const classificacao = nivelAtual === 0 ? "junior" : NIVEIS[nivelAtual - 1];
            salvarResultado({ vitoria: false, classificacao });
            return;
          }
        }
      }

    // ── FASE B ─────────────────────────────────────────────
    } else {
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
          // Regra especial Senior: volta para Fase A
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

    // Avança para a próxima pergunta
    setCurrentIndex((i) => (i + 1 < questions.length ? i + 1 : 0));
    setSelectedOption(null);
  }

  // ── Clique numa alternativa ────────────────────────────────
  function handleSelect(index: number) {
    if (selectedOption !== null) return;

    const now = Date.now();
    if (now - lastAnswerTime.current < 3000) {
      setSuspicious(true);
      if (suspiciousTimer.current) clearTimeout(suspiciousTimer.current);
      suspiciousTimer.current = setTimeout(() => setSuspicious(false), 5000);
    }
    lastAnswerTime.current = now;

    setSelectedOption(index);

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

  // ── Próxima pergunta ───────────────────────────────────────
  function handleNext() {
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

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Nenhuma pergunta encontrada.</p>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // TELA DO QUIZ
  // ─────────────────────────────────────────────────────────────────────────
  const currentQuestion = questions[currentIndex];
  const nomeNivel = NIVEIS[nivelAtual];
  const progressPct = calcularProgresso(nivelAtual, faseAtual);

  return (
    <div className="min-h-screen bg-gray-50">
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
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-4">
          <span className="text-xs font-semibold px-2 py-1 rounded-full bg-gray-100 text-gray-500 mb-3 inline-block uppercase tracking-wide">
            {NIVEL_LABELS[nomeNivel]}
          </span>
          <h2 className="text-lg font-semibold text-gray-800 leading-relaxed">
            {currentQuestion.question}
          </h2>
        </div>

        {/* Alternativas */}
        <div className="space-y-3 mb-4">
          {currentQuestion.options.map((option, index) => {
            const isSelected = selectedOption === index;
            const isCorrect = index === currentQuestion.correctIndex;
            const revealed = selectedOption !== null;

            let borderColor = "border-gray-200";
            let bgColor = "bg-white";

            if (revealed) {
              if (isCorrect) {
                borderColor = "border-green-500";
                bgColor = "bg-green-50";
              } else if (isSelected && !isCorrect) {
                borderColor = "border-red-500";
                bgColor = "bg-red-50";
              }
            }

            const opacity = revealed && !isCorrect && !isSelected ? "opacity-45" : "";

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
                {revealed && isCorrect && (
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                )}
                {revealed && isSelected && !isCorrect && (
                  <X className="w-5 h-5 text-red-500 flex-shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Explicação */}
        {selectedOption !== null && currentQuestion.explanation && (
          <div className="bg-gray-50 rounded-xl p-4 mb-4">
            <p className="text-sm text-gray-500">
              <strong className="text-gray-800">Explicação:</strong> {currentQuestion.explanation}
            </p>
          </div>
        )}

        {/* Botão próxima */}
        {selectedOption !== null && (
          <button
            onClick={handleNext}
            className="w-full h-12 bg-[#F5C518] text-[#1F3864] font-bold rounded-lg hover:bg-yellow-400 transition flex items-center justify-center gap-2"
          >
            <span>Próxima</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}