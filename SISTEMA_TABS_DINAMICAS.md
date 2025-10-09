# 🎯 Sistema de Navegación Dinámica - Explicación Completa

## 📚 Cómo Funciona el Sistema de Tabs Dinámicas

### Arquitectura de Layouts Anidados

El sistema utiliza **Layouts Anidados** de Next.js App Router para cargar tabs diferentes según la ruta:

```
RootLayout (Sidebar + TopBar)
  │
  ├── / (Home - SIN tabs)
  │
  ├── /products (Layout con TABS de Products)
  │   ├── /products/list
  │   ├── /products/gantt
  │   └── /products/metrics
  │
  └── /projects (Layout con TABS de Projects - ¡DIFERENTES!)
      ├── /projects/overview
      ├── /projects/timeline
      ├── /projects/team
      └── /projects/budget
```

---

## 🏗️ Estructura de Archivos

### 1. **Layout Principal** (`src/app/layout.tsx`)
```tsx
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Sidebar />          {/* Barra vertical - siempre visible */}
        <div className="ml-20">
          <TopBar />         {/* Barra superior - siempre visible */}
          <main className="pt-16">
            {children}       {/* Aquí se renderiza el contenido dinámico */}
          </main>
        </div>
      </body>
    </html>
  );
}
```

**Elementos fijos:**
- ✅ `Sidebar` - Siempre visible
- ✅ `TopBar` - Siempre visible
- 🔄 `{children}` - Cambia según la ruta

---

### 2. **Layout de Products** (`src/app/products/layout.tsx`)

```tsx
const productTabs = [
  { id: 'list', label: 'List', href: '/products/list' },
  { id: 'gantt', label: 'Gantt', href: '/products/gantt' },
  { id: 'metrics', label: 'Metrics', href: '/products/metrics' },
];

export default function ProductsLayout({ children }) {
  return (
    <>
      {/* Tabs ESPECÍFICAS de Products */}
      <TabNavigation basePath="/products" tabs={productTabs} />
      
      <div className="p-6">
        {children}  {/* Lista, Gantt o Metrics */}
      </div>
    </>
  );
}
```

**Cuando estás en `/products/list`:**
1. Se renderiza `RootLayout` (Sidebar + TopBar)
2. Dentro de `{children}` se renderiza `ProductsLayout`
3. `ProductsLayout` muestra las tabs de Products
4. Dentro del `{children}` de `ProductsLayout` se muestra `page.tsx` de list

---

### 3. **Layout de Projects** (`src/app/projects/layout.tsx`)

```tsx
const projectTabs = [
  { id: 'overview', label: 'Overview', href: '/projects/overview' },
  { id: 'timeline', label: 'Timeline', href: '/projects/timeline' },
  { id: 'team', label: 'Team', href: '/projects/team' },
  { id: 'budget', label: 'Budget', href: '/projects/budget' },
];

export default function ProjectsLayout({ children }) {
  return (
    <>
      {/* Tabs DIFERENTES - específicas de Projects */}
      <TabNavigation basePath="/projects" tabs={projectTabs} />
      
      <div className="p-6">
        {children}  {/* Overview, Timeline, Team o Budget */}
      </div>
    </>
  );
}
```

**Cuando estás en `/projects/overview`:**
1. Se renderiza `RootLayout` (Sidebar + TopBar)
2. Dentro de `{children}` se renderiza `ProjectsLayout`
3. `ProjectsLayout` muestra las tabs de Projects (¡diferentes a Products!)
4. Dentro del `{children}` de `ProjectsLayout` se muestra `page.tsx` de overview

---

## 🔄 Flujo de Renderizado

### Ejemplo 1: Usuario navega a `/products/list`

```
1. Next.js detecta la ruta: /products/list

2. Renderiza RootLayout:
   ┌──────────────────────────────────────┐
   │ Sidebar (fijo)                       │
   │ TopBar (fijo)                        │
   │ ┌────────────────────────────────┐   │
   │ │ {children} ← ProductsLayout    │   │
   │ └────────────────────────────────┘   │
   └──────────────────────────────────────┘

3. ProductsLayout renderiza:
   ┌────────────────────────────────────┐
   │ TabNavigation (List|Gantt|Metrics) │ ← Tabs de Products
   │ ┌──────────────────────────────┐   │
   │ │ {children} ← page.tsx (list) │   │
   │ └──────────────────────────────┘   │
   └────────────────────────────────────┘

4. Resultado final:
   Sidebar + TopBar + Tabs de Products + Contenido de List
```

### Ejemplo 2: Usuario navega a `/projects/timeline`

```
1. Next.js detecta la ruta: /projects/timeline

2. Renderiza RootLayout:
   ┌──────────────────────────────────────┐
   │ Sidebar (fijo)                       │
   │ TopBar (fijo)                        │
   │ ┌────────────────────────────────┐   │
   │ │ {children} ← ProjectsLayout    │   │
   │ └────────────────────────────────┘   │
   └──────────────────────────────────────┘

3. ProjectsLayout renderiza:
   ┌────────────────────────────────────────────┐
   │ TabNavigation (Overview|Timeline|Team|Budget) │ ← Tabs de Projects
   │ ┌──────────────────────────────────────┐    │
   │ │ {children} ← page.tsx (timeline)     │    │
   │ └──────────────────────────────────────┘    │
   └────────────────────────────────────────────┘

4. Resultado final:
   Sidebar + TopBar + Tabs de Projects + Contenido de Timeline
```

### Ejemplo 3: Usuario está en `/` (Home)

```
1. Next.js detecta la ruta: /

2. Renderiza RootLayout:
   ┌──────────────────────────────────────┐
   │ Sidebar (fijo)                       │
   │ TopBar (fijo)                        │
   │ ┌────────────────────────────────┐   │
   │ │ {children} ← page.tsx (home)   │   │
   │ └────────────────────────────────┘   │
   └──────────────────────────────────────┘

3. Home NO tiene layout adicional, por lo que NO hay tabs

4. Resultado final:
   Sidebar + TopBar + Contenido de Home (SIN tabs)
```

---

## 📋 Comparación Visual

| Ruta | Sidebar | TopBar | Tabs | Contenido |
|------|---------|--------|------|-----------|
| `/` | ✅ | ✅ | ❌ | Dashboard |
| `/products/list` | ✅ | ✅ | ✅ Products Tabs | Lista de productos |
| `/products/gantt` | ✅ | ✅ | ✅ Products Tabs | Vista Gantt |
| `/projects/overview` | ✅ | ✅ | ✅ Projects Tabs | Overview de proyectos |
| `/projects/team` | ✅ | ✅ | ✅ Projects Tabs | Gestión de equipo |

---

## 🎨 Componente TabNavigation

```tsx
// src/components/TabNavigation.tsx
export default function TabNavigation({ basePath, tabs }) {
  const pathname = usePathname(); // Hook de Next.js para obtener ruta actual

  return (
    <div className="bg-white border-b">
      {tabs.map((tab) => {
        const isActive = pathname === tab.href; // Compara ruta actual con tab
        
        return (
          <Link href={tab.href}>
            {tab.label}
            {isActive && <div className="border-b-2 border-indigo-600" />}
          </Link>
        );
      })}
    </div>
  );
}
```

**Props:**
- `basePath`: Ruta base (ej: `/products`)
- `tabs`: Array de objetos con las tabs específicas

---

## 🚀 Cómo Agregar una Nueva Sección con Tabs

### Ejemplo: Agregar sección "Documents"

**1. Crear el layout** (`src/app/documents/layout.tsx`):
```tsx
import TabNavigation from '@/components/TabNavigation';

const documentTabs = [
  { id: 'all', label: 'All Documents', href: '/documents/all' },
  { id: 'recent', label: 'Recent', href: '/documents/recent' },
  { id: 'archived', label: 'Archived', href: '/documents/archived' },
];

export default function DocumentsLayout({ children }) {
  return (
    <>
      <TabNavigation basePath="/documents" tabs={documentTabs} />
      <div className="p-6">{children}</div>
    </>
  );
}
```

**2. Crear página principal** (`src/app/documents/page.tsx`):
```tsx
import { redirect } from 'next/navigation';

export default function DocumentsPage() {
  redirect('/documents/all'); // Redirige a la primera tab
}
```

**3. Crear páginas de tabs:**
- `src/app/documents/all/page.tsx`
- `src/app/documents/recent/page.tsx`
- `src/app/documents/archived/page.tsx`

**¡Listo!** Ahora cuando navegues a `/documents`, verás:
- Sidebar ✅
- TopBar ✅
- Tabs de Documents ✅ (All Documents | Recent | Archived)
- Contenido de la tab seleccionada ✅

---

## 💡 Ventajas de Este Sistema

1. **Modular**: Cada sección tiene sus propias tabs
2. **Escalable**: Agregar nuevas secciones es fácil
3. **Mantenible**: Tabs definidas cerca de su contenido
4. **Performance**: Next.js solo carga lo necesario
5. **Type-safe**: TypeScript en todos los componentes

---

## 🎯 Resumen

- **TopBar**: NO contiene tabs, solo logo + search + user
- **Tabs dinámicas**: Se cargan desde el layout de cada sección
- **Products**: Tiene tabs de List, Gantt, Metrics
- **Projects**: Tiene tabs de Overview, Timeline, Team, Budget
- **Home**: NO tiene tabs
- **Futuro**: Cada nueva sección puede tener sus propias tabs únicas

¡El sistema es completamente dinámico y cada sección controla sus propias tabs! 🚀
