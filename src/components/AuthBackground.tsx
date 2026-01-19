import { palette } from "../theme/theme";

type Props = {
  children: React.ReactNode;
};

const AuthBackground = ({ children }: Props) => {
  return (
    <div
      style={{
        minHeight: "100vh",
        position: "relative",
        overflow: "hidden",
        background: `linear-gradient(135deg, ${palette.background.default} 0%, #eef2f7 40%, #f7f7fb 100%)`,
        display: "grid",
        placeItems: "center",
        padding: "24px",
      }}
    >
      {/* Blobs decorativos */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "-120px",
          left: "-120px",
          width: "340px",
          height: "340px",
          borderRadius: "50%",
          background: `${palette.primary.main}22`,
          filter: "blur(2px)",
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          bottom: "-140px",
          right: "-140px",
          width: "420px",
          height: "420px",
          borderRadius: "50%",
          background: `${palette.secondary.main}22`,
          filter: "blur(2px)",
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "15%",
          right: "10%",
          width: "220px",
          height: "220px",
          borderRadius: "50%",
          background: "#94a3b822",
          filter: "blur(1px)",
        }}
      />

      {/* grid sutil */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(15, 23, 42, 0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(15, 23, 42, 0.04) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
          maskImage: "radial-gradient(circle at center, black 30%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Contenido */}
      <div style={{ position: "relative", width: "100%", display: "grid", placeItems: "center" }}>
        {children}
      </div>
    </div>
  );
};

export default AuthBackground;
