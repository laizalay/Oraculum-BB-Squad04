import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../services/firebase";
import { useAuth } from "../context/AuthContext";
import { Shield, Users, LogOut, BarChart3, Download, TrendingDown, Search, ChevronDown, ChevronUp } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

interface EmployeeData {
  user_id: string;
  name: string;
  full_name: string;
  level: string;
  department: string | null;
  leveling_completed: boolean;
  role: string;
}

interface AttemptData {
  id: string;
  user_id: string;
  score: number;
  total_questions: number;
  wrong_by_category?: Record<string, number>;
  completed_at?: string;
}

const COLORS = ["#f59e0b", "#3b82f6", "#10b981", "#34d399"];
const levelLabels: Record<string, string> = { 
  junior: "Júnior", pleno: "Pleno", senior: "Sênior", "senior+": "Sênior+",
};
export default function ManagerDashboard() {
  const { logout } = useAuth();
  const [employees, setEmployees] = useState<EmployeeData[]>([]);
  const [attempts, setAttempts] = useState<AttemptData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "employees">("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedEmployee, setExpandedEmployee] = useState<string | null>(null);
  const [filterLevel, setFilterLevel] = useState("todos");
  const [filterStatus, setFilterStatus] = useState("todos");
  const [sortBy, setSortBy] = useState("nome");

  useEffect(() => {
    const loadData = async () => {
      const [usersSnap, attemptsSnap] = await Promise.all([
        getDocs(collection(db, "users")),
        getDocs(collection(db, "quiz_attempts")),
      ]);
      const allUsers: EmployeeData[] = [];
      usersSnap.forEach(d => allUsers.push({ user_id: d.id, ...d.data() } as EmployeeData));
      setEmployees(allUsers.filter(u => u.role !== "manager"));
      const allAttempts: AttemptData[] = [];
      attemptsSnap.forEach(d => allAttempts.push({ id: d.id, ...d.data() } as AttemptData));
      setAttempts(allAttempts);
      setLoading(false);
    };
    loadData();
  }, []);

  const levelDistribution = ["junior", "pleno", "senior", "senior+"]
    .map(level => ({ name: levelLabels[level], value: employees.filter(e => e.level === level).length }))
    .filter(item => item.value > 0);

  const avgScore = attempts.length > 0
    ? Math.round(attempts.reduce((sum, a) => sum + (a.total_questions > 0 ? (a.score / a.total_questions) * 100 : 0), 0) / attempts.length)
    : 0;

  const filteredEmployees = employees.filter(e =>
    (e.name ?? e.full_name ?? "").toLowerCase().includes(searchTerm.toLowerCase())
  );


  const finalEmployees = filteredEmployees
  .filter(e => filterLevel === "todos" || e.level === filterLevel)
  .filter(e => filterStatus === "todos" || (filterStatus === "concluido" ? e.leveling_completed : !e.leveling_completed))
  .sort((a, b) => {
    const avgA = attempts.filter(x => x.user_id === a.user_id).reduce((s, x) => s + (x.total_questions > 0 ? (x.score / x.total_questions) * 100 : 0), 0) / Math.max(attempts.filter(x => x.user_id === a.user_id).length, 1);
    const avgB = attempts.filter(x => x.user_id === b.user_id).reduce((s, x) => s + (x.total_questions > 0 ? (x.score / x.total_questions) * 100 : 0), 0) / Math.max(attempts.filter(x => x.user_id === b.user_id).length, 1);
    if (sortBy === "nome") return (a.name ?? a.full_name ?? "").localeCompare(b.name ?? b.full_name ?? "");
    if (sortBy === "acerto_maior") return avgB - avgA;
    if (sortBy === "acerto_menor") return avgA - avgB;
    if (sortBy === "nivel") {
      const ordem: Record<string, number> = { "senior+": 0, senior: 1, pleno: 2, junior: 3 };
      return (ordem[a.level ?? ""] ?? 4) - (ordem[b.level ?? ""] ?? 4);
    }
    return 0;
  });

  const exportCSV = () => {
    const headers = "Nome,Nível\n";
    const rows = employees.map(e => `"${e.name ?? e.full_name}","${levelLabels[e.level] ?? e.level}"`).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "relatorio_oraculum.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-[#1F3864] px-4 pt-6 pb-16">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F5C518] flex items-center justify-center">
              <Shield className="w-5 h-5 text-[#1F3864]" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Oraculum BB</h1>
              <p className="text-xs text-white/70">Painel do Gestor</p>
            </div>
          </div>
          <button onClick={logout} className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 -mt-10 pb-8 space-y-6">
        {loading ? (
          <div className="bg-white rounded-2xl p-12 text-center text-gray-500">Carregando dados...</div>
        ) : (
          <>
            <div className="flex gap-2 bg-white rounded-2xl p-1.5 shadow-lg">
              {[{ id: "overview", label: "Visão Geral", icon: <BarChart3 className="w-4 h-4" /> },
                { id: "employees", label: "Funcionários", icon: <Users className="w-4 h-4" /> }].map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id as "overview" | "employees")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-medium transition-all ${
                    activeTab === tab.id ? "bg-[#1F3864] text-white shadow-sm" : "text-gray-500 hover:text-gray-800"
                  }`}>
                  {tab.icon}<span>{tab.label}</span>
                </button>
              ))}
            </div>

            {activeTab === "overview" && (
              <>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { icon: <Users className="w-5 h-5 text-[#1F3864]" />, value: employees.length, label: "Funcionários" },
                    { icon: <BarChart3 className="w-5 h-5 text-yellow-500" />, value: attempts.length, label: "Quizzes" },
                    { icon: <TrendingDown className="w-5 h-5 text-green-500" />, value: `${avgScore}%`, label: "Acerto Médio" },
                  ].map((stat, i) => (
                    <div key={i} className="bg-white rounded-xl p-4 shadow-sm">
                      <div className="mb-2">{stat.icon}</div>
                      <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                      <p className="text-xs text-gray-500">{stat.label}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="text-sm font-semibold text-gray-800 mb-4">Distribuição por Nível</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={levelDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value">
                        {levelDistribution.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-wrap justify-center gap-3 mt-3">
                    {levelDistribution.map((item, i) => (
                      <div key={i} className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                        <span className="text-xs text-gray-600">{item.name}: {item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingDown className="w-4 h-4 text-red-500" />
                    <h3 className="text-sm font-semibold text-gray-800">Assuntos com Maior Dificuldade</h3>
                  </div>
                  {(() => {
                    const allWrong: Record<string, number> = {};
                    attempts.forEach((a: any) => {
                      const wrong = a.wrong_by_category ?? {};
                      Object.entries(wrong).forEach(([cat, count]) => {
                        allWrong[cat] = (allWrong[cat] ?? 0) + (count as number);
                      });
                    });
                    const list = Object.entries(allWrong)
                      .map(([name, count]) => ({ name, count }))
                      .sort((a, b) => b.count - a.count)
                      .slice(0, 5);
                    return list.length > 0 ? (
                      <div className="space-y-2">
                        {list.map((item, i) => (
                          <div key={i} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                            <span className="text-sm text-gray-800">{item.name}</span>
                            <span className="text-xs font-medium text-red-500">
                              {item.count} {item.count === 1 ? "erro" : "erros"}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400 text-center">Nenhum dado de respostas disponível ainda</p>
                    );
                  })()}
                </div>

                <button onClick={exportCSV}
                  className="w-full flex items-center justify-center gap-2 py-3 border-2 border-[#1F3864] text-[#1F3864] font-semibold rounded-xl hover:bg-[#1F3864] hover:text-white transition">
                  <Download className="w-4 h-4" /> Exportar CSV
                </button>
              </>
            )}

            {activeTab === "employees" && (
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" placeholder="Buscar funcionário..." value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full bg-white rounded-xl pl-10 pr-4 py-3 text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1F3864]/50" />
                </div>

                <div className="bg-white rounded-xl p-4 shadow-sm space-y-3">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 mb-2">Nível</p>
                    <div className="flex flex-wrap gap-2">
                      {["todos", "junior", "pleno", "senior", "senior+"].map(lvl => (
                        <button key={lvl} onClick={() => setFilterLevel(lvl)}
                          className={`px-3 py-1 rounded-full text-xs font-medium transition ${filterLevel === lvl ? "bg-[#1F3864] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                          {lvl === "todos" ? "Todos" : levelLabels[lvl] ?? lvl}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 mb-2">Status do Quiz</p>
                    <div className="flex gap-2">
                      {[{value: "todos", label: "Todos"}, {value: "concluido", label: "Concluído"}, {value: "pendente", label: "Pendente"}].map(s => (
                        <button key={s.value} onClick={() => setFilterStatus(s.value)}
                          className={`px-3 py-1 rounded-full text-xs font-medium transition ${filterStatus === s.value ? "bg-[#1F3864] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 mb-2">Ordenar por</p>
                    <div className="flex flex-wrap gap-2">
                      {[{value: "nome", label: "Nome A-Z"}, {value: "acerto_maior", label: "Maior acerto"}, {value: "acerto_menor", label: "Menor acerto"}, {value: "nivel", label: "Nível"}].map(s => (
                        <button key={s.value} onClick={() => setSortBy(s.value)}
                          className={`px-3 py-1 rounded-full text-xs font-medium transition ${sortBy === s.value ? "bg-[#1F3864] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  <div className="p-4 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-800">{finalEmployees.length} Funcionários</h3>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {finalEmployees.length === 0 ? (
                      <div className="p-8 text-center text-gray-500 text-sm">Nenhum funcionário encontrado</div>
                    ) : finalEmployees.map(emp => {
                      const empAttempts = attempts.filter(a => a.user_id === emp.user_id);
                      const empAvg = empAttempts.length > 0
                        ? Math.round(empAttempts.reduce((s, a) => s + (a.total_questions > 0 ? (a.score / a.total_questions) * 100 : 0), 0) / empAttempts.length)
                        : 0;
                      const isExpanded = expandedEmployee === emp.user_id;
                      const displayName = emp.name ?? emp.full_name ?? "Sem nome";
                      return (
                        <div key={emp.user_id}>
                          <button onClick={() => setExpandedEmployee(isExpanded ? null : emp.user_id)}
                            className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors text-left">
                            <div className="w-10 h-10 rounded-full bg-[#F5C518] flex items-center justify-center text-sm font-bold text-[#1F3864] flex-shrink-0">
                              {(displayName[0] ?? "?").toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-800 text-sm truncate">{displayName}</p>
                              <p className="text-xs text-gray-500">{empAvg}% Acerto médio</p>
                            </div>
                            <span className="text-xs px-2 py-0.5 rounded-full font-medium text-white bg-blue-500">
                              {levelLabels[emp.level] ?? emp.level ?? "Júnior"}
                            </span>
                            {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                          </button>
                          {isExpanded && (
                            <div className="px-4 pb-4 bg-gray-50 space-y-2">
                              <p className="text-xs text-gray-500 pt-2">
                                {empAttempts.length === 0 ? "Funcionário ainda não realizou o quiz." : `Acerto médio: ${empAvg}%`}
                              </p>
                              {(() => {
                                const lastAttempt = empAttempts[empAttempts.length - 1] as any;
                                const wrongByCategory = lastAttempt?.wrong_by_category ?? {};
                                const list = Object.entries(wrongByCategory)
                                  .map(([name, count]) => ({ name, count: count as number }))
                                  .sort((a, b) => b.count - a.count);
                                return list.length > 0 ? (
                                  <div className="mt-2">
                                    <p className="text-xs font-semibold text-gray-600 mb-1">Temas com mais erros:</p>
                                    {list.map((item, i) => (
                                      <div key={i} className="flex justify-between text-xs text-gray-500 py-0.5">
                                        <span>{item.name}</span>
                                        <span className="text-red-500">{item.count} {item.count === 1 ? "erro" : "erros"}</span>
                                      </div>
                                    ))}
                                  </div>
                                ) : null;
                              })()}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
      }
