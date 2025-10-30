import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { syncAuthUser } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

// 📦 Importa tus íconos de redes (puedes usar imágenes locales o URLs)
import googleIcon from "@/assets/google.svg";
import githubIcon from "@/assets/github-1.svg";
import facebookIcon from "@/assets/facebook.svg";
import udeatlasLogo from "@/assets/logo-removebg-preview.png"; // <-- coloca tu logo aquí

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // 📧 Login con email y contraseña
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Por favor completa todos los campos");
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) throw error;

      const sync = await syncAuthUser(data.user);
      if (sync.success) {
        toast.success("Bienvenido a UdeAtlas!");
        window.location.href = "/";
      } else {
        toast.error(sync.error);
      }
    } catch (error: any) {
      toast.error(error.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  // 🌐 Login con redes sociales
  const handleSocialLogin = async (provider: "google" | "github" | "facebook") => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: window.location.origin },
      });

      if (error) throw error;

      supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          const sync = await syncAuthUser(session.user);
          if (sync.success) {
            toast.success("Inicio de sesión exitoso!");
            window.location.href = "/";
          } else {
            toast.error(sync.error);
          }
        }
      });
    } catch (error: any) {
      toast.error(error.message || "Error con el inicio de sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-emerald-50 to-white">
      <Card className="w-[400px] shadow-lg rounded-2xl">
        <CardHeader className="text-center">
          <img src={udeatlasLogo} alt="UdeAtlas Logo" className="w-24 mx-auto mb-2" />
          <CardTitle className="text-2xl font-bold text-emerald-700">
            Bienvenido a UdeAtlas
          </CardTitle>
          <p className="text-sm text-gray-500 mt-1">Inicia sesión para continuar</p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleEmailLogin} className="flex flex-col gap-3">
            <Input
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
            <Input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white mt-2"
            >
              {loading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : "Iniciar sesión"}
            </Button>
          </form>

          <div className="flex items-center my-4">
            <div className="flex-1 h-px bg-gray-300" />
            <span className="px-2 text-sm text-gray-500">o continúa con</span>
            <div className="flex-1 h-px bg-gray-300" />
          </div>

          <div className="flex justify-center gap-4">
            <button
              onClick={() => handleSocialLogin("google")}
              disabled={loading}
              className="p-2 hover:scale-110 transition-transform"
            >
              <img src={googleIcon} alt="Google" className="w-8 h-8" />
            </button>

            <button
              onClick={() => handleSocialLogin("github")}
              disabled={loading}
              className="p-2 hover:scale-110 transition-transform"
            >
              <img src={githubIcon} alt="GitHub" className="w-8 h-8" />
            </button>

            <button
              onClick={() => handleSocialLogin("facebook")}
              disabled={loading}
              className="p-2 hover:scale-110 transition-transform"
            >
              <img src={facebookIcon} alt="Facebook" className="w-8 h-8" />
            </button>
          </div>
        </CardContent>

        <CardFooter className="text-center text-xs text-gray-500">
          © {new Date().getFullYear()} UdeAtlas. Todos los derechos reservados.
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
