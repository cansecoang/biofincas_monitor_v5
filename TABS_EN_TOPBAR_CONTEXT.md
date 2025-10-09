# 🎯 Sistema de Tabs Dinámicas en TopBar - React Context

## ✅ Solución Implementada

Las pestañas ahora se **renderizan dentro del TopBar** y se cargan dinámicamente según la ruta usando **React Context API**.

---

## 🏗️ Arquitectura del Sistema

### 1. **Context API** (`src/contexts/TabsContext.tsx`)

Contexto global que almacena las tabs actuales:

\`\`\`tsx
// Estado global compartido
{
  tabs: Tab[],        // Array de tabs actuales
  basePath: string,   // Ruta base (ej: "/products")
  setTabs: (tabs, basePath) => void  // Función para actualizar tabs
}
\`\`\`

**¿Cómo funciona?**
- Cualquier componente puede "registrar" sus tabs
- El TopBar "lee" las tabs registradas y las muestra

---

### 2. **TopBar Mejorado** (`src/components/TopBar.tsx`)

Ahora tiene **dos secciones**:

\`\`\`tsx
<header>
  {/* Sección 1: Logo, Search, User - SIEMPRE visible */}
  <div className="h-16">
    <Logo />
    <Search />
    <UserProfile />
  </div>

  {/* Sección 2: Tabs - Solo visible si hay tabs registradas */}
  {tabs.length > 0 && (
    <div className="border-t">
      {tabs.map(tab => <Tab />)}
    </div>
  )}
</header>
\`\`\`

**Características:**
- ✅ Tabs se renderizan **dentro del TopBar**
- ✅ Solo aparecen si hay tabs registradas
- ✅ Resalta la tab activa automáticamente

---

### 3. **TabsLayout** (`src/components/TabsLayout.tsx`)

Componente helper que registra las tabs:

\`\`\`tsx
export default function TabsLayout({ tabs, basePath, children }) {
  const { setTabs } = useTabsContext();

  useEffect(() => {
    // Al montarse: registra las tabs en el contexto
    setTabs(tabs, basePath);

    // Al desmontarse: limpia las tabs
    return () => setTabs([], '');
  }, [tabs, basePath]);

  return <div>{children}</div>;
}
\`\`\`

**¿Por qué es importante?**
- Automáticamente registra tabs cuando entras a una sección
- Automáticamente limpia tabs cuando sales de una sección

---

### 4. **Layouts de Secciones** (Productos, Proyectos, etc.)

Cada sección define sus tabs y usa `TabsLayout`:

\`\`\`tsx
// src/app/products/layout.tsx
const productTabs = [
  { id: 'list', label: 'List', href: '/products/list' },
  { id: 'gantt', label: 'Gantt', href: '/products/gantt' },
  { id: 'metrics', label: 'Metrics', href: '/products/metrics' },
];

export default function ProductsLayout({ children }) {
  return (
    <TabsLayout tabs={productTabs} basePath="/products">
      {children}
    </TabsLayout>
  );
}
\`\`\`

---

## 🔄 Flujo Completo

### Ejemplo: Usuario navega a `/products/list`

\`\`\`
1. Next.js carga la ruta: /products/list

2. RootLayout se renderiza:
   ├─ TabsProvider (inicia contexto global)
   ├─ Sidebar (visible)
   ├─ TopBar (lee contexto, aún sin tabs)
   └─ {children} → ProductsLayout

3. ProductsLayout se monta:
   ├─ TabsLayout ejecuta useEffect
   ├─ setTabs([List, Gantt, Metrics], "/products")
   └─ Contexto se actualiza ✅

4. TopBar detecta cambio en contexto:
   ├─ tabs.length > 0 → true
   ├─ Renderiza sección de tabs
   └─ Muestra: List | Gantt | Metrics ✅

5. Usuario ve:
   ┌─────────────────────────────────────┐
   │ Biofincas | Search | 🔔 | User      │ ← TopBar (sección 1)
   ├─────────────────────────────────────┤
   │ List | Gantt | Metrics              │ ← Tabs (sección 2)
   ├─────────────────────────────────────┤
   │ Contenido de List                   │
   └─────────────────────────────────────┘
\`\`\`

### Ejemplo: Usuario navega a `/` (Home)

\`\`\`
1. Next.js carga la ruta: /

2. RootLayout se renderiza:
   ├─ TabsProvider
   ├─ Sidebar
   ├─ TopBar (lee contexto, sin tabs)
   └─ {children} → page.tsx (Home)

3. Home NO tiene TabsLayout:
   ├─ No se ejecuta setTabs()
   └─ Contexto mantiene tabs = []

4. TopBar detecta:
   ├─ tabs.length > 0 → false
   └─ NO renderiza sección de tabs ❌

5. Usuario ve:
   ┌─────────────────────────────────────┐
   │ Biofincas | Search | 🔔 | User      │ ← Solo TopBar
   ├─────────────────────────────────────┤
   │ Contenido de Home                   │ ← Sin tabs
   └─────────────────────────────────────┘
\`\`\`

---

## 📋 Comparación: Antes vs Ahora

| Aspecto | Antes (TabNavigation) | Ahora (Context API) |
|---------|----------------------|---------------------|
| **Ubicación** | Debajo del TopBar | Dentro del TopBar ✅ |
| **Renderizado** | En cada layout | En TopBar ✅ |
| **Comunicación** | Props locales | Context global ✅ |
| **Limpieza** | Manual | Automática ✅ |
| **Escalabilidad** | Limitada | Excelente ✅ |

---

## 🚀 Cómo Agregar Nueva Sección con Tabs

### Ejemplo: Crear sección "Documents"

**1. Crear layout con tabs:**

\`\`\`tsx
// src/app/documents/layout.tsx
import TabsLayout from '@/components/TabsLayout';

const documentTabs = [
  { id: 'all', label: 'All', href: '/documents/all' },
  { id: 'recent', label: 'Recent', href: '/documents/recent' },
  { id: 'archived', label: 'Archived', href: '/documents/archived' },
];

export default function DocumentsLayout({ children }) {
  return (
    <TabsLayout tabs={documentTabs} basePath="/documents">
      {children}
    </TabsLayout>
  );
}
\`\`\`

**2. Crear páginas:**
- \`src/app/documents/page.tsx\` → redirect a /all
- \`src/app/documents/all/page.tsx\`
- \`src/app/documents/recent/page.tsx\`
- \`src/app/documents/archived/page.tsx\`

**¡Listo!** Las tabs aparecerán automáticamente en el TopBar cuando navegues a `/documents`.

---

## 💡 Ventajas del Sistema

### ✅ Tabs en TopBar
- Las tabs se renderizan **dentro** del componente TopBar
- Diseño consistente con la imagen de referencia

### ✅ Dinámico
- Cada sección define sus propias tabs
- TopBar las muestra automáticamente

### ✅ Limpio
- No hay lógica condicional compleja
- Cada layout es independiente

### ✅ Escalable
- Agregar nuevas secciones es súper fácil
- Solo necesitas usar \`TabsLayout\`

### ✅ Performance
- React Context optimizado
- Solo re-renderiza cuando cambian las tabs

---

## 🎨 Estructura Visual

\`\`\`
┌─────────────────────────────────────────────┐
│  TopBar Component                           │
│  ┌─────────────────────────────────────┐    │
│  │ Logo | Search | Notifications | User│    │
│  └─────────────────────────────────────┘    │
│  ┌─────────────────────────────────────┐    │
│  │ Tab 1 | Tab 2 | Tab 3 | Tab 4      │ ←── Tabs dinámicas
│  └─────────────────────────────────────┘    │
└─────────────────────────────────────────────┘
\`\`\`

---

## 📁 Archivos del Sistema

\`\`\`
src/
├── contexts/
│   └── TabsContext.tsx         ← Context API para tabs
├── components/
│   ├── TopBar.tsx              ← Lee tabs del contexto
│   ├── TabsLayout.tsx          ← Registra tabs en contexto
│   └── Sidebar.tsx
└── app/
    ├── layout.tsx              ← Envuelve con TabsProvider
    ├── products/
    │   ├── layout.tsx          ← Define tabs de Products
    │   └── ...
    └── projects/
        ├── layout.tsx          ← Define tabs de Projects
        └── ...
\`\`\`

---

## 🎯 Resumen

**¿Cómo funciona?**
1. `TabsProvider` crea contexto global
2. Cada layout usa `TabsLayout` para registrar sus tabs
3. TopBar lee las tabs del contexto y las renderiza
4. Tabs aparecen/desaparecen automáticamente según la ruta

**¿Dónde se renderizan las tabs?**
✅ **Dentro del componente TopBar** (no en layouts individuales)

**¿Cómo se actualizan?**
✅ **Automáticamente** vía React Context cuando cambias de ruta

¡El sistema es completamente dinámico y las tabs siempre se muestran en el TopBar! 🚀
