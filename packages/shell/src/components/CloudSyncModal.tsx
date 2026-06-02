import React, { useState, useEffect, useRef } from "react";
import { supabase, isSupabaseConfigured } from "../utils/supabase";

interface CloudSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CloudSyncModal({ isOpen, onClose }: CloudSyncModalProps): React.ReactElement | null {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!supabase) return;
    const client = supabase;

    const checkUser = async () => {
      try {
        const { data: { user } } = await client.auth.getUser();
        setUserEmail(user?.email || null);
      } catch (err) {
        console.error("Failed to retrieve user session:", err);
      }
    };
    void checkUser();

    const { data: { subscription } } = client.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user?.email || null);
    });

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    const client = supabase;

    setLoading(true);
    setErrorMsg(null);
    setMessage(null);

    try {
      if (isSignUp) {
        const { error } = await client.auth.signUp({ email, password });
        if (error) throw error;
        setMessage("REGISTRATION SUCCESS. VERIFY EMAIL IF REQUIRED.");
      } else {
        const { error } = await client.auth.signInWithPassword({ email, password });
        if (error) throw error;
        setMessage("LOGIN SUCCESSFUL. CLOUD PROGRESS SYNCED.");
        timeoutRef.current = setTimeout(onClose, 1500);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setErrorMsg(errorMessage.toUpperCase() || "AUTH ERROR");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    if (!supabase) return;
    const client = supabase;
    setLoading(true);
    try {
      const { error } = await client.auth.signOut();
      if (error) throw error;
      setMessage("LOGOUT SUCCESSFUL. LOCAL REPO REMAINS ACTIVE.");
      timeoutRef.current = setTimeout(onClose, 1500);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setErrorMsg(errorMessage.toUpperCase() || "LOGOUT ERROR");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="w-full max-w-md retro-window max-h-[90vh] overflow-y-auto">
        <div className="window-header">
          <span className="window-header-accent font-press">SYS_AUTHENTICATOR.EXE</span>
          <button
            onClick={onClose}
            className="text-cozy-accent hover:underline bg-transparent border-none cursor-pointer font-press text-[9px]"
            aria-label="Close Cloud Sync Modal"
          >
            [X]
          </button>
        </div>
        <div className="window-body p-6 flex flex-col gap-4 font-press text-[10px] text-cozy-text leading-relaxed">
          {!isSupabaseConfigured ? (
            <div className="flex flex-col gap-3 text-red-500">
              <p className="text-[11px] font-bold">⚠ CONFIGURATION ERROR</p>
              <p className="text-[8px] leading-4 text-cozy-text">
                LOCAL STORAGE FALLBACK IS IN EFFECT. CLOUD SYNC IS DISABLED.
                TO ENABLE CLOUD SYNC, PLEASE ADD THESE KEYS TO YOUR .env FILE:
              </p>
              <pre className="p-3 bg-black/60 border border-dashed border-red-900 text-[7px] text-red-400 overflow-x-auto whitespace-pre-wrap select-all">
                VITE_SUPABASE_URL=your_project_url{"\n"}
                VITE_SUPABASE_ANON_KEY=your_anon_key
              </pre>
            </div>
          ) : userEmail ? (
            <div className="flex flex-col gap-4">
              <div className="border border-dashed border-cozy-border p-3 bg-black/40">
                <p className="text-cozy-accent">STATUS: CONNECTED</p>
                <p className="text-[8px] mt-1 text-cozy-text/70">ACCOUNT: {userEmail}</p>
                <p className="text-[8px] mt-1 text-green-500">✔ SYNC: AUTOMATIC CLOUD SYNC ACTIVE</p>
              </div>

              {message && <p className="text-green-500 text-[8px]">{message}</p>}
              {errorMsg && <p className="text-red-500 text-[8px]">ERROR: {errorMsg}</p>}

              <button
                onClick={() => {
                  void handleLogout();
                }}
                disabled={loading}
                className="w-full pixel-btn bg-red-950/20 text-red-500 border-red-900 hover:bg-red-900 hover:text-white"
              >
                {loading ? "TERMINATING..." : "LOG OUT"}
              </button>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                void handleAuth(e);
              }}
              className="flex flex-col gap-4"
            >
              <div className="text-[8px] text-cozy-text/70 mb-2 leading-4">
                AUTHENTICATE TO LINK YOUR RETRO PET PROGRESS AND LEVEL COMPLETIONS TO THE CLOUD.
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="email-input" className="text-cozy-accent text-[8px]">EMAIL_ADDR:</label>
                <input
                  id="email-input"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black border border-cozy-border text-cozy-text p-2 font-mono text-[10px] focus:outline-none focus:border-cozy-accent"
                  placeholder="user@cozyos.net"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="password-input" className="text-cozy-accent text-[8px]">ACCESS_KEY:</label>
                <input
                  id="password-input"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black border border-cozy-border text-cozy-text p-2 font-mono text-[10px] focus:outline-none focus:border-cozy-accent"
                  placeholder="••••••••"
                />
              </div>

              {message && <p className="text-green-500 text-[8px]">{message}</p>}
              {errorMsg && <p className="text-red-500 text-[8px]">ERROR: {errorMsg}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full pixel-btn bg-cozy-accent text-black font-bold py-2 mt-2"
              >
                {loading ? "EXECUTING..." : isSignUp ? "REGISTER ACCOUNT" : "SIGN IN"}
              </button>

              <div className="text-center mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setErrorMsg(null);
                    setMessage(null);
                  }}
                  className="text-[8px] text-cozy-accent hover:underline bg-transparent border-none cursor-pointer"
                >
                  {isSignUp ? "ALREADY INSTALLED? LOG IN" : "NEW TERMINAL ID? REGISTER HERE"}
                </button>
              </div>
            </form>
          )}

          <div className="border-t border-dashed border-cozy-border pt-3 mt-1 flex justify-between items-center text-[7px] text-cozy-text/40">
            <span>SYS.VER: 4.7-SECURE</span>
            <span className="animate-pulse">_BLINK</span>
          </div>
        </div>
      </div>
    </div>
  );
}
