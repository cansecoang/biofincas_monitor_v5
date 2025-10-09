# Sharia - Loan Management System

Sistema de gestión de préstamos desarrollado con Next.js, TypeScript y Tailwind CSS, optimizado para Vercel.

## 🎨 Diseño y Navegación

El sistema utiliza una arquitectura de navegación de dos niveles basada en la imagen de referencia:

### 1. **NVP (Navegación Vertical Principal)** - Sidebar Izquierdo
Barra vertical fija que contiene las rutas principales de la aplicación:
- Dashboard (Home)
- Products
- Projects  
- Documents
- Trash

### 2. **NHS (Navegación Horizontal de Subrutas)** - Tab Navigation
Pestañas horizontales que aparecen debajo del TopBar y muestran las subrutas de la sección activa:
- Para Products: List, Gantt, Metrics
- Cada pestaña cambia el contenido sin recargar la página (navegación instantánea)

### 3. **TopBar** - Barra Superior
- Site ID (Logo "Sharia")
- Navegación contextual (Home Loan, Car Loan, Maintenance, Booster)
- Búsqueda
- Notificaciones
- Perfil de usuario (Matt Shadows)

## 🚀 Tecnologías

- **Next.js 15** - Framework de React con App Router
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Estilos utility-first
- **Lucide React** - Iconos
- **React 19** - Biblioteca de UI

## 💻 Instalación y Desarrollo

\`\`\`bash
# Instalar dependencias
npm install

# Instalar lucide-react para iconos
npm install lucide-react

# Ejecutar servidor de desarrollo
npm run dev
\`\`\`

Abre [http://localhost:3000](http://localhost:3000) para ver la aplicación.

## 🎯 Flujo de Navegación

### Flujo Completo del Usuario:

1. **Entrada al Sitio**
   - Usuario ve TopBar con Site ID "Sharia" y opciones principales
   - Sidebar (NVP) muestra navegación principal resaltada

2. **Selección de Sección Principal (NVP)**
   - Usuario hace clic en "Products" en el Sidebar
   - El Sidebar resalta visualmente la selección con fondo azul
   - La ruta cambia a \`/products\`

3. **Carga de Subrutas (NHS)**
   - NHS (TabNavigation) aparece con pestañas: List, Gantt, Metrics
   - Vista por defecto (\`/products/list\`) se carga automáticamente
   - Navegación instantánea sin recargar

4. **Cambio de Vista**
   - Usuario hace clic en pestaña "Gantt"
   - La pestaña se activa visualmente (línea inferior azul)
   - Contenido cambia a vista Gantt instantáneamente

5. **Profundización de Datos**
   - Usuario selecciona un producto de la lista
   - Modal puede abrirse manteniendo navegación visible
   - Usuario mantiene contexto de localización

## 🏗️ Estructura del Proyecto

\`\`\`
src/
├── app/
│   ├── layout.tsx              # Layout principal con Sidebar + TopBar
│   ├── page.tsx                # Dashboard / Home
│   ├── products/
│   │   ├── layout.tsx          # Layout con TabNavigation
│   │   ├── page.tsx            # Redirect a /products/list
│   │   ├── list/
│   │   │   └── page.tsx        # Vista de lista de productos
│   │   ├── gantt/
│   │   │   └── page.tsx        # Vista Gantt
│   │   └── metrics/
│   │       └── page.tsx        # Vista de métricas
│   ├── api/
│   │   ├── hello/
│   │   │   └── route.ts        # Endpoint GET/POST básico
│   │   └── products/
│   │       └── [id]/
│   │           └── route.ts    # CRUD con parámetros dinámicos
│   └── globals.css             # Estilos globales con Tailwind
├── components/
│   ├── Sidebar.tsx             # Navegación vertical (NVP)
│   ├── TopBar.tsx              # Barra superior con búsqueda y usuario
│   └── TabNavigation.tsx       # Navegación de pestañas (NHS)
\`\`\`

## 🎨 Componentes Principales

### Sidebar (NVP)
- Navegación vertical fija de 64px de ancho
- Iconos con Lucide React
- Resalta automáticamente la ruta activa con fondo azul índigo
- Botón flotante "+" en la parte inferior para acciones rápidas
- Fondo oscuro (slate-900)

### TopBar
- Barra superior fija con:
  - Logo circular con inicial "S"
  - Nombre "Sharia"
  - Links de navegación contextual
  - Buscador con icono
  - Campana de notificaciones (con indicador verde)
  - Avatar y nombre de usuario

### TabNavigation (NHS)
- Pestañas horizontales debajo del TopBar
- Línea indicadora azul en la pestaña activa
- Hover states para mejor UX
- Navegación instantánea entre vistas

## 📱 Responsive Design

- **Mobile**: Sidebar se mantiene, TopBar adaptativo
- **Tablet**: Layout optimizado con navegación visible
- **Desktop**: Experiencia completa con todos los elementos

## 🔧 Personalización

### Agregar Nuevas Secciones

1. **Agrega el item en \`Sidebar.tsx\`:**
\`\`\`typescript
{
  id: 'nueva-seccion',
  label: 'Nueva Sección',
  icon: <Icon size={20} />,
  href: '/nueva-seccion',
}
\`\`\`

2. **Crea la estructura de carpetas:**
\`\`\`
src/app/nueva-seccion/
  ├── layout.tsx      # Con TabNavigation si tiene subrutas
  ├── page.tsx        # Contenido principal
  └── subruta/
      └── page.tsx
\`\`\`

3. **Define las tabs en el layout:**
\`\`\`typescript
const tabs = [
  { id: 'sub1', label: 'Subruta 1', href: '/nueva-seccion/sub1' },
  { id: 'sub2', label: 'Subruta 2', href: '/nueva-seccion/sub2' },
];
\`\`\`

## 🌐 API Routes para Vercel

### Endpoints Disponibles

- \`GET /api/hello\` - Mensaje de bienvenida
- \`POST /api/hello\` - Procesar datos JSON
- \`GET /api/products/[id]\` - Obtener producto por ID
- \`PUT /api/products/[id]\` - Actualizar producto
- \`DELETE /api/products/[id]\` - Eliminar producto

### Uso de API Routes

\`\`\`typescript
// Ejemplo: Obtener producto
const response = await fetch('/api/products/123');
const data = await response.json();
\`\`\`

## 🚀 Deploy en Vercel

\`\`\`bash
# Opción 1: Vercel CLI
npm i -g vercel
vercel

# Opción 2: Conectar repositorio Git
# 1. Sube tu código a GitHub/GitLab/Bitbucket
# 2. Importa el proyecto en vercel.com
# 3. Deploy automático en cada push
\`\`\`

## 📝 Scripts Disponibles

- \`npm run dev\` - Servidor de desarrollo en http://localhost:3000
- \`npm run build\` - Crear build de producción
- \`npm start\` - Servidor de producción
- \`npm run lint\` - Ejecutar linter ESLint

## 🎯 Features Implementadas

- ✅ Navegación de dos niveles (NVP + NHS)
- ✅ Sidebar con iconos y resaltado activo
- ✅ TopBar con búsqueda y perfil de usuario
- ✅ Tab Navigation para subrutas
- ✅ Páginas de ejemplo (List, Gantt, Metrics)
- ✅ API Routes para Vercel
- ✅ TypeScript completo
- ✅ Tailwind CSS configurado
- ✅ Responsive design
- ✅ Navegación instantánea (Client-side routing)

## 🔜 Próximos Pasos

- [ ] Implementar React Query para caché (5 min TTL)
- [ ] Agregar modales para detalles de productos
- [ ] Implementar autenticación
- [ ] Agregar gráficos reales (Chart.js o Recharts)
- [ ] Conectar con backend real
- [ ] Agregar tests con Jest y React Testing Library

## 📄 Licencia

Proyecto MVP - Sharia Loan Management System
# biofincas_monitor_v5
