import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Lock, Mail, User } from "lucide-react";
import { palette, shadows } from "../theme/theme";
import AuthBackground from "../components/AuthBackground";



const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  border: `1px solid ${palette.border}`,
  borderRadius: "10px",
  fontSize: "14px",
  background: palette.background.paper,
  color: palette.text.primary,
  outline: "none",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "0.85rem",
  fontWeight: 600,
  color: palette.text.secondary,
  marginBottom: "8px",
};

const buttonStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: "10px",
  border: "none",
  cursor: "pointer",
  fontWeight: 700,
  background: palette.primary.main,
  color: "white",
  boxShadow: "0 4px 12px rgba(39, 110, 144, 0.2)",
};

const helperLinkStyle: React.CSSProperties = {
  color: palette.primary.main,
  fontWeight: 700,
  textDecoration: "none",
};

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

const RegisterPage = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [touched, setTouched] = useState({ name: false, email: false, password: false });
  const [error, setError] = useState<string | null>(null);

  const nameError = useMemo(() => {
    if (!touched.name) return null;
    if (!name.trim()) return "El nombre es obligatorio.";
    if (name.trim().length < 3) return "Mínimo 3 caracteres.";
    return null;
  }, [name, touched.name]);

  const emailError = useMemo(() => {
    if (!touched.email) return null;
    if (!email.trim()) return "El correo es obligatorio.";
    if (!isValidEmail(email)) return "Ingresa un correo válido.";
    return null;
  }, [email, touched.email]);

  const passwordError = useMemo(() => {
    if (!touched.password) return null;
    if (!password) return "La contraseña es obligatoria.";
    if (password.length < 6) return "Mínimo 6 caracteres.";
    return null;
  }, [password, touched.password]);

  const canSubmit =
    !nameError && !emailError && !passwordError && name.trim() && email.trim() && password;

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    setTouched({ name: true, email: true, password: true });
    if (!canSubmit) return;

    // Por ahora, sin backend: simulamos registro exitoso y te mandamos a login.
    // Cuando tengamos endpoints, aquí llamaremos financialApi.post("/auth/register", ...)
    navigate("/login", { replace: true });
  };

  return (
    <AuthBackground>
        <div
        style={{
            minHeight: "100vh",
            background: palette.background.default,
            display: "grid",
            placeItems: "center",
            padding: "24px",
        }}
        >
        <div
            style={{
            width: "100%",
            maxWidth: "420px",
            background: palette.background.paper,
            borderRadius: "16px",
            padding: "24px",
            boxShadow: shadows.card,
            border: `1px solid ${palette.border}`,
            }}
        >
            <div style={{ marginBottom: "18px" }}>
            <h1
                style={{
                margin: 0,
                fontSize: "1.6rem",
                fontWeight: 800,
                color: palette.text.primary,
                }}
            >
                Crear cuenta
            </h1>
            <p style={{ margin: "8px 0 0", color: palette.text.secondary }}>
                Regístrate con nombre, correo y contraseña.
            </p>
            </div>

            {error && (
            <div
                style={{
                background: "#fee2e2",
                border: "1px solid #fecaca",
                color: "#991b1b",
                borderRadius: "12px",
                padding: "10px 12px",
                fontSize: "0.9rem",
                marginBottom: "14px",
                }}
            >
                {error}
            </div>
            )}

            <form onSubmit={onSubmit} style={{ display: "grid", gap: "14px" }}>
            <div>
                <label style={labelStyle}>Nombre</label>
                <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    paddingLeft: "12px",
                    borderRadius: "10px",
                    border: `1px solid ${palette.border}`,
                }}
                >
                <User size={18} color={palette.text.secondary} />
                <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, name: true }))}
                    placeholder="Tu nombre"
                    autoComplete="name"
                    style={{ ...inputStyle, border: "none", paddingLeft: 0 }}
                />
                </div>
                {nameError && (
                <div style={{ marginTop: "6px", color: "#b91c1c", fontSize: "0.85rem" }}>
                    {nameError}
                </div>
                )}
            </div>

            <div>
                <label style={labelStyle}>Correo</label>
                <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    paddingLeft: "12px",
                    borderRadius: "10px",
                    border: `1px solid ${palette.border}`,
                }}
                >
                <Mail size={18} color={palette.text.secondary} />
                <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                    placeholder="correo@ejemplo.com"
                    autoComplete="email"
                    style={{ ...inputStyle, border: "none", paddingLeft: 0 }}
                />
                </div>
                {emailError && (
                <div style={{ marginTop: "6px", color: "#b91c1c", fontSize: "0.85rem" }}>
                    {emailError}
                </div>
                )}
            </div>

            <div>
                <label style={labelStyle}>Contraseña</label>
                <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    paddingLeft: "12px",
                    borderRadius: "10px",
                    border: `1px solid ${palette.border}`,
                }}
                >
                <Lock size={18} color={palette.text.secondary} />
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    style={{ ...inputStyle, border: "none", paddingLeft: 0 }}
                />
                </div>
                {passwordError && (
                <div style={{ marginTop: "6px", color: "#b91c1c", fontSize: "0.85rem" }}>
                    {passwordError}
                </div>
                )}
            </div>

            <button type="submit" style={{ ...buttonStyle, opacity: canSubmit ? 1 : 0.6 }}>
                Crear cuenta
            </button>
            </form>

            <div
            style={{
                marginTop: "16px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "12px",
                flexWrap: "wrap",
                color: palette.text.secondary,
                fontSize: "0.9rem",
            }}
            >
            <span>¿Ya tienes cuenta?</span>
            <Link to="/login" style={helperLinkStyle}>
                Ir a login
            </Link>
            </div>
        </div>
        </div>
    </AuthBackground>
  );
};

export default RegisterPage;
