import { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendEmailVerification,
  sendPasswordResetEmail,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../services/firebase";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  register: (name: string, email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  async function register(name: string, email: string, password: string) {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(user, { displayName: name });
    // Força atualização do user no estado após updateProfile
    setUser({ ...user });
    
    await setDoc(doc(db, "users", user.uid), {
      name,
      email,
      role: "aluno",
      level: null,
      leveling_completed: false,
      createdAt: serverTimestamp(),
    });
    await sendEmailVerification(user);
  }

  async function login(email: string, password: string) {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    if (!credential.user.emailVerified) {
      await signOut(auth);
      throw new Error("Por favor, verifique seu e-mail antes de fazer login.");
    }
  }

  async function logout() {
    await signOut(auth);
  }

  async function resetPassword(email: string) {
  await sendPasswordResetEmail(auth, email, {
    url: "https://oraculum-bb-squad04.vercel.app/auth/action",
    handleCodeInApp: true,
  });
}
  
  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout, resetPassword }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
