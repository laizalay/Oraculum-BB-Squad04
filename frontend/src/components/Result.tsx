import { useState, useEffect } from "react";
import { db } from "../services/firebase";
import { useAuth } from "../context/AuthContext";
import { Trophy, AlertTriangle } from "lucide-react";
import { collection, query, where, orderBy, limit, getDocs, getDoc, doc } from "firebase/firestore";

interface ResultProps {
  onHome: () => void;
}

interface WrongCategory {
  name: string;
  count: number;
}

const NIVEL_LABELS: Record<string, string> = {
  junior: "Júnior",
  pleno: "Pleno",
  senior: "Sênior",
};

export default function Result({ onHome }: ResultProps) {
  const { user } = useAuth();
  const [level, setLevel] = useState<string | null>(null);
  const [wrongCategories, setWrongCategories] = useState<WrongCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function buscarResultado() {
      if (!user) return;
      try {
        const userSnap = await getDoc(doc(db, "users", user.uid));
        if (userSnap.exists()) {
          const data = userSnap.data();
          setLevel(data.level ?? null);
        }

        const q = query(
          collection(db, "quiz_attempts"),
          where("user_id", "==", user.uid),
          orderBy("completed_at", "desc"),
          limit(1)
        );
        const snap = await getDocs(q);
        if (!snap.empty) {
          const data = snap.docs[0].data();
          const wrongByCategory = data.wrong_by_category ?? {};
          const list = Object.entries(wrongByCategory)
            .map(([name, count]) => ({ name, count: count as number }))
            .sort((a, b) => b.count - a.count);
          setWrongCategories(list);
        }
      } catch (err) {
        console.error("Erro ao buscar resultado:", err);
      } finally {
        setLoading(false);
      }
    }
    buscarResultado();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Carregando resultado...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-sm w-full">

        {/* Ícone */}
        <div className="flex justify-center mb-4">
          <div className="w-20 h-20 rounded-full bg-[#F5C518] flex items-center justify-center">
            <Trophy className="w-10 h-10 text-[#1F3864]" />
          </div>
        </div>

        {/* Título */}
        <h2 className="text-xl font-bold text-gray-800 text-center mb-4">
          Quiz Finalizado!
        </h2>

        {/* Nível */}
        <div className="bg-gray-50 rounded-xl p-4 text-center mb-6">
          <p className="text-sm text-gray-500 mb-1">Seu nível:</p>
          <p className="text-2xl font-bold text-[#1F3864]">
            {level ? NIVEL_LABELS[level] ?? level : "Não definido"}
          </p>
        </div>

        {/* Temas para revisar */}
        {wrongCategories.length > 0 ? (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <h3 className="font-semibold text-gray-800 text-sm">Temas para revisar</h3>
            </div>
            <div className="space-y-2">
              {wrongCategories.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between bg-gray-50 rounded-lg p-3"
                >
                  <span className="text-sm text-gray-800">{item.name}</span>
                  <span className="text-xs font-medium text-red-500">
                    {item.count} {item.count === 1 ? "erro" : "erros"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-green-50 rounded-xl p-4 mb-6 text-center">
            <p className="text-sm text-green-600 font-medium">
              🎉 Perfeito! Você não errou nenhuma questão.
            </p>
          </div>
        )}

        {/* Botão */}
        <button
          onClick={onHome}
          className="w-full bg-[#F5C518] text-[#1F3864] font-bold py-3 rounded-lg hover:bg-yellow-400 transition"
        >
          Início
        </button>

      </div>
    </div>
  );
}
