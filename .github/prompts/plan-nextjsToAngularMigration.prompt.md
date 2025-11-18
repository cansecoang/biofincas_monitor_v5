## Plan: Guía Step-by-Step para Migración Next.js → Angular

Guía completa y detallada para migrar el proyecto BioFincas de Next.js 15 a Angular 18+, diseñada para ejecutarse durante las Semanas 7-8 del plan maestro.

### Steps

1. **Preparación del entorno Angular** - Instalar Angular CLI, crear proyecto con arquitectura modular (core/shared/features), configurar Tailwind CSS, variables de entorno y estructura de carpetas según mejores prácticas empresariales
   
2. **Migrar sistema de navegación y layout** - Convertir `Sidebar`, `TopBar` y `TabsContext` a componentes Angular con servicio de tabs, implementar routing module principal y guards básicos

3. **Crear servicios HTTP y modelos TypeScript** - Generar servicios para consumir API backend (products, tasks, indicators), definir interfaces compartidas, configurar interceptors para manejo de errores y autenticación

4. **Migrar componentes principales por features** - Convertir wizards (`ProductStepWizard`, `TaskStepWizard`), modals, y páginas principales (products, indicators, dashboard) manteniendo lógica de negocio

5. **Implementar autenticación y autorización** - Crear `AuthService`, `AuthGuard`, guards de roles, interceptor JWT, y directivas estructurales para permisos en UI

6. **Migrar visualizaciones y gráficos** - Adaptar componentes D3.js y Recharts a Angular, convertir `gantt-chart.tsx` y `product-matrix.tsx` con ciclo de vida Angular

7. **Configurar lazy loading y optimización** - Implementar módulos con lazy loading, standalone components, service workers para PWA, y build de producción optimizado

8. **Testing y validación de migración** - Crear tests unitarios (Jasmine/Karma), E2E (Cypress/Playwright), validar todas las funcionalidades migradas y realizar ajustes finales

### Further Considerations

1. **¿Mantener monorepo con Nx?** - Opción A: Workspace separado para Angular / Opción B: Monorepo Nx con NestJS backend + Angular frontend + librerías compartidas (RECOMENDADO para mejor DX y code sharing)

2. **¿Estrategia de estado global?** - Opción A: Services con BehaviorSubject (más simple) / Opción B: NGRX Store (más robusto para aplicación grande) / Opción C: Angular Signals (nativo, moderno, recomendado para Angular 18+)

3. **¿Migración gradual o completa?** - Opción A: Big bang (2 semanas intensivas) / Opción B: Incremental con proxy reverso (mantener Next.js + Angular corriendo en paralelo temporalmente)

---

**GUÍA DETALLADA DE MIGRACIÓN NEXT.JS → ANGULAR**
**BioFincas Monitor - Frontend Migration Guide**

---

## 📋 **ÍNDICE**

1. [Preparación del Entorno](#1-preparación-del-entorno)
2. [Análisis del Proyecto Actual](#2-análisis-del-proyecto-actual)
3. [Estructura del Proyecto Angular](#3-estructura-del-proyecto-angular)
4. [Migración de Componentes](#4-migración-de-componentes)
5. [Migración de Servicios y Estado](#5-migración-de-servicios-y-estado)
6. [Routing y Navegación](#6-routing-y-navegación)
7. [Autenticación y Autorización](#7-autenticación-y-autorización)
8. [Estilos y Tailwind CSS](#8-estilos-y-tailwind-css)
9. [Testing](#9-testing)
10. [Optimización y Deployment](#10-optimización-y-deployment)

---

## **1. PREPARACIÓN DEL ENTORNO**

### **Paso 1.1: Instalar Angular CLI**

```bash
# Instalar Angular CLI globalmente
npm install -g @angular/cli@18

# Verificar instalación
ng version
```

### **Paso 1.2: Crear nuevo proyecto Angular**

```bash
# Navegar al directorio raíz de tus proyectos
cd c:\Users\Angel\OneDrive\Documentos\oroverde\product_report_mvp

# Crear proyecto Angular (NO usar routing aún, lo haremos manualmente)
ng new biofincas-angular --routing=false --style=scss --skip-git

# Entrar al proyecto
cd biofincas-angular
```

**Opciones recomendadas:**
- ❌ Routing: No (lo configuraremos manualmente)
- ✅ Stylesheet: SCSS
- ✅ SSR: No (usaremos SPA)
- ✅ Skip Git: Sí (ya tienes repo)

### **Paso 1.3: Instalar dependencias esenciales**

```bash
# Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init

# Librerías de UI y utilidades
npm install lucide-angular
npm install date-fns
npm install class-variance-authority clsx tailwind-merge

# Gráficos (equivalentes a D3 y Recharts)
npm install d3 @types/d3
npm install ngx-charts

# HTTP y RxJS (ya vienen con Angular, pero asegúrate)
npm install rxjs

# Notificaciones (equivalente a sonner)
npm install ngx-toastr
```

### **Paso 1.4: Configurar Tailwind CSS**

**`tailwind.config.js`:**
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        'oroverde-green': '#2D5016',
        'oroverde-light': '#E8F5E9',
      },
    },
  },
  plugins: [],
}
```

**`src/styles.scss`:**
```scss
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Tus estilos globales adicionales */
```

---

## **2. ANÁLISIS DEL PROYECTO ACTUAL**

### **Paso 2.1: Inventario de componentes**

Crea un archivo `MIGRATION_INVENTORY.md`:

```markdown
# Inventario de Migración

## Componentes a Migrar (17 total)

### Layout & Navigation
- [ ] Sidebar.tsx → sidebar.component.ts
- [ ] TopBar.tsx → top-bar.component.ts
- [ ] TabNavigation.tsx → tab-navigation.component.ts
- [ ] TabsLayout.tsx → Ya no necesario (usaremos servicios)

### Wizards
- [ ] ProductStepWizard.tsx → product-step-wizard.component.ts
- [ ] TaskStepWizard.tsx → task-step-wizard.component.ts

### Modals
- [ ] ProductDetailModal.tsx → product-detail-modal.component.ts
- [ ] TaskDetailModal.tsx → task-detail-modal.component.ts
- [ ] IndicatorDetailModal.tsx → indicator-detail-modal.component.ts
- [ ] ProductListModal.tsx → product-list-modal.component.ts
- [ ] NotificationsModal.tsx → notifications-modal.component.ts
- [ ] DeleteConfirmationModal.tsx → delete-confirmation-modal.component.ts
- [ ] CancelConfirmationModal.tsx → cancel-confirmation-modal.component.ts

### Visualizaciones
- [ ] gantt-chart.tsx → gantt-chart.component.ts
- [ ] product-matrix.tsx → product-matrix.component.ts

### UI Components
- [ ] ui/NotificationCard.tsx → ui/notification-card.component.ts

## Context/Services a Migrar
- [ ] TabsContext.tsx → tabs.service.ts

## Páginas a Migrar
- [ ] app/page.tsx (Dashboard) → dashboard.component.ts
- [ ] app/products/list/page.tsx → products-list.component.ts
- [ ] app/products/matrix/page.tsx → products-matrix.component.ts
- [ ] app/products/gantt/page.tsx → products-gantt.component.ts
- [ ] app/products/metrics/page.tsx → products-metrics.component.ts
- [ ] app/indicators/overview/page.tsx → indicators-overview.component.ts
- [ ] app/indicators/output/page.tsx → indicators-output.component.ts
- [ ] app/indicators/workpackage/page.tsx → indicators-workpackage.component.ts
- [ ] app/create/product/page.tsx → create-product.component.ts
- [ ] app/create/task/page.tsx → create-task.component.ts

## API Endpoints → Services
- [ ] /api/products → products.service.ts
- [ ] /api/tasks → tasks.service.ts
- [ ] /api/indicators → indicators.service.ts
- [ ] /api/users → users.service.ts
- [ ] (... resto de endpoints)
```

### **Paso 2.2: Mapeo de patrones React → Angular**

Crea `REACT_TO_ANGULAR_PATTERNS.md`:

```markdown
# Patrones de Conversión React → Angular

## Hooks → Angular Equivalents

| React Hook | Angular Equivalent |
|-----------|-------------------|
| `useState` | `signal()` o property con `@Input/@Output` |
| `useEffect` | `ngOnInit()`, `ngOnChanges()`, `effect()` |
| `useContext` | Service con Dependency Injection |
| `useRouter` | `Router` service |
| `usePathname` | `Router.url` |
| `useSearchParams` | `ActivatedRoute.queryParams` |
| `useRef` | `ViewChild`, `ElementRef` |
| `useMemo` | `computed()` (signals) o memoization manual |
| `useCallback` | método de clase normal |

## Componentes

| React | Angular |
|-------|---------|
| Function Component | `@Component` class |
| Props | `@Input()` |
| Events/Callbacks | `@Output() EventEmitter` |
| Children | `<ng-content>` |
| Conditional `{condition && <div>}` | `@if (condition) { <div> }` o `*ngIf` |
| Lists `{items.map()}` | `@for (item of items) {}` o `*ngFor` |
| CSS Modules | Component styles (encapsulated) |

## Estado y Navegación

| React | Angular |
|-------|---------|
| Context API | Services (singleton) |
| `<Link href="">` | `<a routerLink="">` |
| `router.push()` | `router.navigate()` |
| Layout components | Router outlets |

## Formularios

| React | Angular |
|-------|---------|
| Controlled inputs | `[(ngModel)]` o Reactive Forms |
| Form validation | `Validators`, Custom Validators |
| Form state | `FormGroup`, `FormControl` |
```

---

## **3. ESTRUCTURA DEL PROYECTO ANGULAR**

### **Paso 3.1: Crear estructura de carpetas**

```bash
# Desde raíz del proyecto Angular
cd src/app

# Crear módulos principales
ng generate module core
ng generate module shared
ng generate module features/products
ng generate module features/indicators
ng generate module features/dashboard
ng generate module features/create

# Crear servicios core
ng generate service core/services/auth
ng generate service core/services/tabs
ng generate service core/services/http-client

# Crear guards
ng generate guard core/guards/auth
ng generate guard core/guards/role
```

**Estructura final:**
```
src/app/
├── core/                     # Singleton services, guards, interceptors
│   ├── guards/
│   │   ├── auth.guard.ts
│   │   └── role.guard.ts
│   ├── interceptors/
│   │   ├── auth.interceptor.ts
│   │   └── error.interceptor.ts
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── tabs.service.ts
│   │   ├── products.service.ts
│   │   ├── tasks.service.ts
│   │   ├── indicators.service.ts
│   │   └── http-client.service.ts
│   └── core.module.ts
│
├── shared/                   # Componentes reutilizables
│   ├── components/
│   │   ├── sidebar/
│   │   ├── top-bar/
│   │   ├── tab-navigation/
│   │   ├── modals/
│   │   └── ui/
│   ├── directives/
│   │   └── has-permission.directive.ts
│   ├── pipes/
│   └── shared.module.ts
│
├── features/                 # Módulos por feature
│   ├── dashboard/
│   │   ├── dashboard.component.ts
│   │   └── dashboard.module.ts
│   ├── products/
│   │   ├── pages/
│   │   │   ├── products-list/
│   │   │   ├── products-matrix/
│   │   │   ├── products-gantt/
│   │   │   └── products-metrics/
│   │   ├── components/
│   │   │   ├── product-step-wizard/
│   │   │   └── product-detail-modal/
│   │   ├── products-routing.module.ts
│   │   └── products.module.ts
│   ├── indicators/
│   │   └── ...
│   └── create/
│       └── ...
│
├── models/                   # Interfaces y tipos
│   ├── product.model.ts
│   ├── task.model.ts
│   ├── indicator.model.ts
│   └── user.model.ts
│
├── app-routing.module.ts
├── app.component.ts
└── app.module.ts
```

### **Paso 3.2: Configurar módulo Core**

**`core/core.module.ts`:**
```typescript
import { NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AuthService } from './services/auth.service';
import { TabsService } from './services/tabs.service';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { ErrorInterceptor } from './interceptors/error.interceptor';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    HttpClientModule
  ],
  providers: [
    AuthService,
    TabsService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ErrorInterceptor,
      multi: true
    }
  ]
})
export class CoreModule {
  // Asegurar que Core se importe solo una vez
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    if (parentModule) {
      throw new Error('CoreModule is already loaded. Import it in AppModule only');
    }
  }
}
```

---

## **4. MIGRACIÓN DE COMPONENTES**

### **Paso 4.1: Ejemplo - Migrar Sidebar**

**ANTES (React - `Sidebar.tsx`):**
```tsx
'use client';
import { Home, Package, Target, Plus } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();
  
  const menuItems = [
    { icon: Home, label: 'Dashboard', href: '/' },
    { icon: Package, label: 'Products', href: '/products' },
    // ...
  ];

  return (
    <aside className="w-64 bg-white border-r">
      {menuItems.map((item) => (
        <Link 
          key={item.href}
          href={item.href}
          className={pathname.startsWith(item.href) ? 'active' : ''}
        >
          <item.icon />
          {item.label}
        </Link>
      ))}
    </aside>
  );
}
```

**DESPUÉS (Angular - `sidebar.component.ts`):**
```typescript
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LucideAngularModule, Home, Package, Target, Plus } from 'lucide-angular';

interface MenuItem {
  icon: any;
  label: string;
  href: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  template: `
    <aside class="w-64 bg-white border-r">
      @for (item of menuItems; track item.href) {
        <a 
          [routerLink]="item.href"
          routerLinkActive="active"
          class="flex items-center gap-3 px-4 py-3 hover:bg-gray-100"
        >
          <lucide-icon [name]="item.icon" [size]="20"></lucide-icon>
          <span>{{ item.label }}</span>
        </a>
      }
    </aside>
  `,
  styles: [`
    .active {
      @apply bg-oroverde-green text-white;
    }
  `]
})
export class SidebarComponent {
  menuItems: MenuItem[] = [
    { icon: 'home', label: 'Dashboard', href: '/' },
    { icon: 'package', label: 'Products', href: '/products' },
    { icon: 'target', label: 'Indicators', href: '/indicators' },
    { icon: 'plus', label: 'Create', href: '/create' }
  ];

  constructor(private router: Router) {}
}
```

### **Paso 4.2: Ejemplo - Migrar ProductStepWizard (Complejo)**

**ANTES (React - simplificado):**
```tsx
'use client';
import { useState, useEffect } from 'react';

export default function ProductStepWizard({ onComplete, editMode, productId }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({...});
  const [workpackages, setWorkpackages] = useState([]);

  useEffect(() => {
    fetch('/api/work-packages')
      .then(res => res.json())
      .then(data => setWorkpackages(data));
  }, []);

  const handleNext = () => setCurrentStep(prev => prev + 1);
  const handleSubmit = async () => {
    const res = await fetch('/api/add-product', {
      method: 'POST',
      body: JSON.stringify(formData)
    });
    if (res.ok) onComplete();
  };

  return (
    <div>
      {currentStep === 1 && <Step1 data={formData} onChange={setFormData} />}
      {/* ... más steps */}
      <button onClick={handleNext}>Next</button>
      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
}
```

**DESPUÉS (Angular):**

**`product-step-wizard.component.ts`:**
```typescript
import { Component, OnInit, Output, EventEmitter, Input, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductsService } from '@core/services/products.service';
import { WorkPackage, Product } from '@models';

@Component({
  selector: 'app-product-step-wizard',
  templateUrl: './product-step-wizard.component.html',
  styleUrls: ['./product-step-wizard.component.scss']
})
export class ProductStepWizardComponent implements OnInit {
  @Input() editMode = false;
  @Input() productId?: string;
  @Output() complete = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  currentStep = signal(1);
  form!: FormGroup;
  workpackages = signal<WorkPackage[]>([]);
  isLoading = signal(false);

  constructor(
    private fb: FormBuilder,
    private productsService: ProductsService
  ) {
    this.initForm();
  }

  ngOnInit() {
    this.loadWorkpackages();
    if (this.editMode && this.productId) {
      this.loadProductData();
    }
  }

  private initForm() {
    this.form = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      workpackageId: ['', Validators.required],
      // ... más campos
    });
  }

  private loadWorkpackages() {
    this.productsService.getWorkPackages().subscribe({
      next: (data) => this.workpackages.set(data),
      error: (err) => console.error(err)
    });
  }

  nextStep() {
    if (this.currentStep() < 5) {
      this.currentStep.update(s => s + 1);
    }
  }

  previousStep() {
    if (this.currentStep() > 1) {
      this.currentStep.update(s => s - 1);
    }
  }

  async submit() {
    if (this.form.invalid) return;

    this.isLoading.set(true);
    const formValue = this.form.value;

    this.productsService.createProduct(formValue).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.complete.emit();
      },
      error: (err) => {
        this.isLoading.set(false);
        console.error(err);
      }
    });
  }
}
```

**`product-step-wizard.component.html`:**
```html
<div class="wizard-container">
  <!-- Progress Steps -->
  <div class="steps-indicator">
    @for (step of [1,2,3,4,5]; track step) {
      <div [class.active]="currentStep() >= step" class="step">
        {{ step }}
      </div>
    }
  </div>

  <!-- Form -->
  <form [formGroup]="form">
    @switch (currentStep()) {
      @case (1) {
        <div class="step-content">
          <h2>General Information</h2>
          <input formControlName="name" placeholder="Product Name" />
          <textarea formControlName="description"></textarea>
        </div>
      }
      @case (2) {
        <div class="step-content">
          <h2>Location and Context</h2>
          <select formControlName="workpackageId">
            @for (wp of workpackages(); track wp.id) {
              <option [value]="wp.id">{{ wp.name }}</option>
            }
          </select>
        </div>
      }
      <!-- ... más casos -->
    }
  </form>

  <!-- Navigation Buttons -->
  <div class="wizard-footer">
    <button (click)="cancel.emit()" type="button">Cancel</button>
    
    @if (currentStep() > 1) {
      <button (click)="previousStep()" type="button">Previous</button>
    }
    
    @if (currentStep() < 5) {
      <button (click)="nextStep()" type="button">Next</button>
    }
    
    @if (currentStep() === 5) {
      <button 
        (click)="submit()" 
        type="button"
        [disabled]="form.invalid || isLoading()"
      >
        {{ isLoading() ? 'Submitting...' : 'Submit' }}
      </button>
    }
  </div>
</div>
```

---

## **5. MIGRACIÓN DE SERVICIOS Y ESTADO**

### **Paso 5.1: Migrar TabsContext → TabsService**

**ANTES (React - `TabsContext.tsx`):**
```tsx
'use client';
import { createContext, useContext, useState } from 'react';

const TabsContext = createContext({...});

export function TabsProvider({ children }) {
  const [tabs, setTabs] = useState([]);
  const [basePath, setBasePath] = useState('');

  return (
    <TabsContext.Provider value={{ tabs, basePath, setTabs }}>
      {children}
    </TabsContext.Provider>
  );
}

export const useTabsContext = () => useContext(TabsContext);
```

**DESPUÉS (Angular - `tabs.service.ts`):**
```typescript
import { Injectable, signal, computed } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Tab {
  id: string;
  label: string;
  href: string;
}

@Injectable({
  providedIn: 'root'
})
export class TabsService {
  // Opción 1: Usando Signals (Angular 18+, RECOMENDADO)
  tabs = signal<Tab[]>([]);
  basePath = signal<string>('');

  setTabs(newTabs: Tab[], newBasePath: string) {
    this.tabs.set(newTabs);
    this.basePath.set(newBasePath);
  }

  clearTabs() {
    this.tabs.set([]);
    this.basePath.set('');
  }

  // Opción 2: Usando RxJS (si prefieres observables)
  /*
  private tabsSubject = new BehaviorSubject<Tab[]>([]);
  private basePathSubject = new BehaviorSubject<string>('');

  tabs$ = this.tabsSubject.asObservable();
  basePath$ = this.basePathSubject.asObservable();

  setTabs(newTabs: Tab[], newBasePath: string) {
    this.tabsSubject.next(newTabs);
    this.basePathSubject.next(newBasePath);
  }
  */
}
```

### **Paso 5.2: Crear ProductsService**

**`products.service.ts`:**
```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { Product, WorkPackage, Output } from '@models';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  private apiUrl = `${environment.apiUrl}/products`;

  constructor(private http: HttpClient) {}

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl);
  }

  getProductById(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  createProduct(product: Partial<Product>): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, product);
  }

  updateProduct(id: string, product: Partial<Product>): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/${id}`, product);
  }

  deleteProduct(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getWorkPackages(): Observable<WorkPackage[]> {
    return this.http.get<WorkPackage[]>(`${environment.apiUrl}/work-packages`);
  }

  getOutputs(): Observable<Output[]> {
    return this.http.get<Output[]>(`${environment.apiUrl}/outputs`);
  }
}
```

---

## **6. ROUTING Y NAVEGACIÓN**

### **Paso 6.1: Configurar rutas principales**

**`app-routing.module.ts`:**
```typescript
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '@core/guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./features/dashboard/dashboard.module')
      .then(m => m.DashboardModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'products',
    loadChildren: () => import('./features/products/products.module')
      .then(m => m.ProductsModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'indicators',
    loadChildren: () => import('./features/indicators/indicators.module')
      .then(m => m.IndicatorsModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'create',
    loadChildren: () => import('./features/create/create.module')
      .then(m => m.CreateModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login.component')
      .then(m => m.LoginComponent)
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
```

### **Paso 6.2: Routing de Products (ejemplo de nested routes)**

**`products-routing.module.ts`:**
```typescript
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProductsLayoutComponent } from './products-layout.component';

const routes: Routes = [
  {
    path: '',
    component: ProductsLayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'list',
        pathMatch: 'full'
      },
      {
        path: 'list',
        loadComponent: () => import('./pages/products-list/products-list.component')
          .then(m => m.ProductsListComponent)
      },
      {
        path: 'matrix',
        loadComponent: () => import('./pages/products-matrix/products-matrix.component')
          .then(m => m.ProductsMatrixComponent)
      },
      {
        path: 'gantt',
        loadComponent: () => import('./pages/products-gantt/products-gantt.component')
          .then(m => m.ProductsGanttComponent)
      },
      {
        path: 'metrics',
        loadComponent: () => import('./pages/products-metrics/products-metrics.component')
          .then(m => m.ProductsMetricsComponent)
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProductsRoutingModule { }
```

### **Paso 6.3: Layout Component con Tabs**

**`products-layout.component.ts`:**
```typescript
import { Component, OnInit, OnDestroy } from '@angular/core';
import { TabsService, Tab } from '@core/services/tabs.service';

@Component({
  selector: 'app-products-layout',
  template: `
    <div class="products-layout">
      <router-outlet></router-outlet>
    </div>
  `
})
export class ProductsLayoutComponent implements OnInit, OnDestroy {
  private readonly tabs: Tab[] = [
    { id: 'list', label: 'List', href: '/products/list' },
    { id: 'matrix', label: 'Matrix', href: '/products/matrix' },
    { id: 'gantt', label: 'Gantt', href: '/products/gantt' },
    { id: 'metrics', label: 'Metrics', href: '/products/metrics' }
  ];

  constructor(private tabsService: TabsService) {}

  ngOnInit() {
    // Registrar tabs cuando entramos a la sección
    this.tabsService.setTabs(this.tabs, '/products');
  }

  ngOnDestroy() {
    // Limpiar tabs cuando salimos
    this.tabsService.clearTabs();
  }
}
```

---

## **7. AUTENTICACIÓN Y AUTORIZACIÓN**

### **Paso 7.1: AuthService**

**`auth.service.ts`:**
```typescript
import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '@environments/environment';

interface User {
  id: string;
  email: string;
  name: string;
  roles: string[];
}

interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'access_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';

  currentUser = signal<User | null>(null);
  isAuthenticated = signal<boolean>(false);

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.checkAuth();
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, {
      email,
      password
    }).pipe(
      tap(response => this.handleAuthSuccess(response))
    );
  }

  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
    this.router.navigate(['/login']);
  }

  refreshToken(): Observable<AuthResponse> {
    const refreshToken = localStorage.getItem(this.REFRESH_TOKEN_KEY);
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/refresh`, {
      refresh_token: refreshToken
    }).pipe(
      tap(response => this.handleAuthSuccess(response))
    );
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  hasRole(role: string): boolean {
    const user = this.currentUser();
    return user?.roles.includes(role) ?? false;
  }

  hasPermission(permission: string): boolean {
    // Lógica de verificación de permisos
    return true; // Implementar según tu sistema RBAC
  }

  private handleAuthSuccess(response: AuthResponse) {
    localStorage.setItem(this.TOKEN_KEY, response.access_token);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, response.refresh_token);
    this.currentUser.set(response.user);
    this.isAuthenticated.set(true);
  }

  private checkAuth() {
    const token = this.getToken();
    if (token) {
      // Validar token y cargar usuario
      this.isAuthenticated.set(true);
      // Cargar datos del usuario actual
      this.loadCurrentUser();
    }
  }

  private loadCurrentUser() {
    this.http.get<User>(`${environment.apiUrl}/auth/me`).subscribe({
      next: (user) => this.currentUser.set(user),
      error: () => this.logout()
    });
  }
}
```

### **Paso 7.2: AuthGuard**

**`auth.guard.ts`:**
```typescript
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};
```

### **Paso 7.3: Directiva de Permisos**

**`has-permission.directive.ts`:**
```typescript
import { Directive, Input, TemplateRef, ViewContainerRef, OnInit } from '@angular/core';
import { AuthService } from '@core/services/auth.service';

@Directive({
  selector: '[appHasPermission]',
  standalone: true
})
export class HasPermissionDirective implements OnInit {
  @Input() appHasPermission!: string;

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private authService: AuthService
  ) {}

  ngOnInit() {
    if (this.authService.hasPermission(this.appHasPermission)) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainer.clear();
    }
  }
}
```

**Uso:**
```html
<button *appHasPermission="'products:delete'" (click)="deleteProduct()">
  Delete
</button>
```

---

## **8. ESTILOS Y TAILWIND CSS**

### **Paso 8.1: Migrar estilos globales**

Copia tu `globals.css` actual y adáptalo a `styles.scss`:

**`src/styles.scss`:**
```scss
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Variables CSS personalizadas */
:root {
  --oroverde-green: #2D5016;
  --oroverde-light: #E8F5E9;
}

/* Estilos base */
* {
  @apply border-border;
}

body {
  @apply bg-background text-foreground;
  font-feature-settings: "rlig" 1, "calt" 1;
}

/* Clases de utilidad personalizadas */
@layer components {
  .btn-primary {
    @apply bg-oroverde-green text-white px-4 py-2 rounded hover:bg-green-800;
  }

  .card {
    @apply bg-white rounded-lg shadow-sm border p-6;
  }
}
```

### **Paso 8.2: Estilos de componentes**

Angular encapsula estilos por componente automáticamente:

```typescript
@Component({
  selector: 'app-product-card',
  template: `<div class="product-card">...</div>`,
  styles: [`
    .product-card {
      @apply bg-white rounded-lg shadow hover:shadow-md transition-shadow;
      
      &:hover {
        transform: translateY(-2px);
      }
    }
  `]
})
```

---

## **9. TESTING**

### **Paso 9.1: Unit Tests (Jasmine/Karma)**

**`product.service.spec.ts`:**
```typescript
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ProductsService } from './products.service';

describe('ProductsService', () => {
  let service: ProductsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ProductsService]
    });
    service = TestBed.inject(ProductsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should fetch products', () => {
    const mockProducts = [{ id: '1', name: 'Test Product' }];

    service.getProducts().subscribe(products => {
      expect(products).toEqual(mockProducts);
    });

    const req = httpMock.expectOne(`${service['apiUrl']}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockProducts);
  });
});
```

### **Paso 9.2: E2E Tests (Cypress)**

```bash
npm install -D cypress
npx cypress open
```

**`cypress/e2e/products.cy.ts`:**
```typescript
describe('Products Page', () => {
  beforeEach(() => {
    cy.visit('/products/list');
  });

  it('should display products list', () => {
    cy.get('[data-testid="product-item"]').should('have.length.greaterThan', 0);
  });

  it('should open create product modal', () => {
    cy.get('[data-testid="create-product-btn"]').click();
    cy.get('[data-testid="product-wizard"]').should('be.visible');
  });
});
```

---

## **10. OPTIMIZACIÓN Y DEPLOYMENT**

### **Paso 10.1: Build de Producción**

```bash
# Build con AOT compilation
ng build --configuration production

# Analizar bundle size
npm install -D webpack-bundle-analyzer
ng build --stats-json
npx webpack-bundle-analyzer dist/biofincas-angular/stats.json
```

### **Paso 10.2: Configurar PWA**

```bash
ng add @angular/pwa
```

### **Paso 10.3: Deploy a Azure Static Web Apps**

**`azure-static-web-apps.yml`:**
```yaml
name: Azure Static Web Apps CI/CD

on:
  push:
    branches:
      - main

jobs:
  build_and_deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build Angular
        run: npm run build -- --configuration production
      
      - name: Deploy to Azure
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          app_location: "/"
          output_location: "dist/biofincas-angular"
```

---

## **📝 CHECKLIST DE MIGRACIÓN COMPLETA**

### Semana 7: Migración Core
- [ ] Día 1: Setup proyecto Angular + estructura base
- [ ] Día 2: Migrar servicios HTTP y modelos
- [ ] Día 3: Migrar navegación (Sidebar, TopBar, Tabs)
- [ ] Día 4: Migrar autenticación y guards
- [ ] Día 5: Migrar componentes de productos (list, modals)

### Semana 8: Finalización y Optimización
- [ ] Día 1: Migrar indicadores y dashboard
- [ ] Día 2: Migrar wizards y formularios complejos
- [ ] Día 3: Migrar gráficos (Gantt, Matrix, D3)
- [ ] Día 4: Testing y corrección de bugs
- [ ] Día 5: Optimización, PWA, deployment

---

**¡Guía lista para usar! Comienza cuando estés listo.**
