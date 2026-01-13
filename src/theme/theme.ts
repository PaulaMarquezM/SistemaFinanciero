export const palette = {
  // Colores de tu Marca (Extraídos de tu imagen)
  primary: {
    main: '#276E90',       // "Principal" (Azul Petróleo)
    contrastText: '#ffffff'
  },
  secondary: {
    main: '#0A3143',       // "Oscuro" (Azul Marino Profundo)
    light: '#CECFC9',      // "Complementario" (Gris Beige)
    contrastText: '#ffffff'
  },
  
  // Fondos
  background: {
    default: '#EFEFEF',    // "Claro" (Fondo general de la app)
    paper: '#ffffff',      // Blanco puro para las tarjetas
    sidebar: '#0A3143'     // "Oscuro" para el sidebar
  },

  // Textos
  text: {
    primary: '#0A3143',    // Títulos en color Oscuro
    secondary: '#276E90',  // Subtítulos en color Principal
    sidebar: '#CECFC9',    // Texto del menú en color Complementario (buen contraste)
    sidebarActive: '#ffffff' // Texto activo en blanco brillante
  },

  // Bordes y Divisores
  border: '#CECFC9',       // "Complementario"
  divider: 'rgba(206, 207, 201, 0.2)' // Complementario con transparencia
};

export const shadows = {
  card: '0 4px 20px -2px rgba(10, 49, 67, 0.1)', // Sombra con un tinte azulado muy sutil
  soft: '0 2px 4px rgba(0,0,0,0.05)'
};