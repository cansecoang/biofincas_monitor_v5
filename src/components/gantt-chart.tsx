/*
🎨 GANTT CHART CON D3.js - GUÍA DE APRENDIZAJE
===============================================

Este componente es un ejemplo completo de cómo usar D3.js para crear visualizaciones 
interactivas en React. Aquí aprenderás los conceptos fundamentales de D3:

📚 CONCEPTOS CLAVE DE D3:
1. ESCALAS (Scales): Mapean datos a coordenadas visuales
2. SELECTORES: d3.select() y d3.selectAll() para manipular DOM
3. DATA BINDING: .data() vincula datos a elementos DOM
4. ENTER/UPDATE/EXIT: El patrón fundamental de D3 para crear elementos
5. EVENTOS: .on() para manejar interacciones del us    // 🔥 PASO 15: Overlay de duración real (barras rayadas)   // 🔥 PASO 15: Over    // 📍 PASO 17: Agregar indicador de "HOY" (estilo original)ay de duración real (barras rayadas)ario
6. SVG: Elemento    // 📍 PASO 17: Agregar indicador de "HOY" (estilo original) gráficos vectoriales que D3 manipula

🎯 PATRÓN PRINCIPAL DE D3:
selection
  .selectAll("elemento")  // Seleccionar elementos (existentes o no)
  .data(datos)           // Vincular datos
  .enter()               // Para cada dato sin elemento correspondiente
  .append("elemento")    // Crear el elemento
  .attr("atributo", valor) // Establecer atributos/propiedades

📊 ESCALAS USADAS AQUÍ:
- scaleTime: Para fechas → posiciones X (horizontal)
- scaleBand: Para nombres de tareas → posiciones Y (vertical)

🎨 ELEMENTOS SVG CREADOS:
- <rect>: Barras del Gantt, fondos de filas
- <line>: Líneas de grilla, indicador de "hoy"
- <text>: Etiquetas de fechas, nombres de tareas
- <g>: Grupos para organizar elementos relacionados

⚡ INTERACTIVIDAD:
- Event handlers con .on("click", ...) y .on("mouseenter", ...)
- Tooltips posicionados dinámicamente
- Scroll sincronizado entre paneles

🔗 INTEGRACIÓN CON REACT:
- useRef para acceder a elementos DOM
- useEffect para re-renderizar cuando cambian los datos
- Estado de React para controlar interacciones

🎯 CARACTERÍSTICAS ESPECIALES:
- LÍMITE DE VISUALIZACIÓN: Solo 8 tareas visibles sin scroll
- SCROLL VERTICAL: Automático cuando hay más de 8 tareas
- ALTURA DINÁMICA: Se ajusta al contenido (≤8 tareas) o es fija (>8 tareas)
- INDICADOR VISUAL: Muestra cuántas tareas están ocultas
- 🆕 SCROLL SINCRONIZADO: Panel izquierdo (nombres) se mueve junto con timeline
- 🆕 CONTENIDO ALINEADO: Los nombres siempre corresponden a sus barras de tareas
- 🆕 SIN DESBORDAMIENTO: Todo el contenido se mantiene dentro del área visible
*/

"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import * as d3 from "d3"; // 📊 D3.js - biblioteca para manipulación de datos y visualizaciones
import TaskDetailModal from "@/components/TaskDetailModal";
import TaskStepWizard from "@/components/TaskStepWizard";
import { toast } from 'sonner';

// 🎨 Definimos los colores para cada fase del proyecto
// Esto nos permite mantener consistencia visual en todo el chart
const phaseColors = {
  Planning: "#facc15",      // Amarillo para planificación
  Elaboration: "#38bdf8",   // Azul para elaboración 
  Completion: "#91cb3e",    // Verde para completado
  "Sin fase": "#ccc",       // Gris para tareas sin fase definida
};

// 📋 Interface que define la estructura de una tarea tal como viene del backend
// Estas son las propiedades exactas que esperamos recibir de la API
interface Task {
  id: number;
  name: string;
  detail?: string;
  start_planned?: string;      // Fecha de inicio planificada (string ISO)
  end_planned?: string;        // Fecha de fin planificada (string ISO)
  start_actual?: string;       // Fecha de inicio real (opcional)
  end_actual?: string;         // Fecha de fin real (opcional)
  checkin_oro_verde?: string;  // Campos de check-in específicos del dominio
  checkin_user?: string;
  checkin_communication?: string;
  checkin_gender?: string;
  phase_id: number;
  phase_name?: string;
  status_id: number;
  status_name?: string;
  org_id?: number;
  org_name?: string;
  product_id: number;
  product_name?: string;
  created_at: string;
  updated_at: string;
}

// 🎯 Props que recibe el componente GanttChart
interface GanttChartProps {
  tasks: Task[];           // Array de tareas a visualizar
  refreshData: () => void; // Función para refrescar los datos cuando sea necesario
}

// 📊 Interface para las tareas una vez procesadas y listas para D3
// Convertimos strings de fechas a objetos Date y normalizamos los datos
interface FormattedTask {
  id: number;
  task_id: number;
  name: string;
  detail?: string;
  user: string;
  user_id?: number;
  organization: string;      // 🆕 Nombre de la organización
  organization_id?: number;  // 🆕 ID de la organización
  start: Date | null;      // ⚠️ Importante: D3 trabaja mejor con objetos Date
  end: Date | null;
  actualStart: Date | null;
  actualEnd: Date | null;
  phase: string;
  status: string;
  product_id: number;
  checkin_communication?: string;
  checkin_gender?: string;
  checkin_oro_verde?: string;
  checkin_user?: string;
}

const GanttChart = ({ tasks, refreshData }: GanttChartProps) => {
  // 📚 useRef nos permite acceder directamente a elementos DOM
  // En D3, necesitamos referencias a los elementos SVG para manipularlos
  // const scrollRef = useRef<HTMLDivElement>(null);      // [DEPRECATED] Ya no se usa - scroll unificado
  const verticalScrollRef = useRef<HTMLDivElement>(null); // 🆕 Contenedor con scroll unificado (vertical + horizontal)
  const fixedRef = useRef<SVGSVGElement>(null);        // SVG del panel izquierdo (nombres de tareas)
  const svgRef = useRef<SVGSVGElement>(null);          // SVG principal del timeline
  
  // 🆕 Referencias para headers fijos
  const headerLeftRef = useRef<SVGSVGElement>(null);     // SVG del header izquierdo (etiquetas)
  const headerTimelineRef = useRef<SVGSVGElement>(null); // SVG del header del timeline (fechas/fases)
  const headerScrollRef = useRef<HTMLDivElement>(null);  // Contenedor de scroll del header (div interno)
  
  // 📅 Estado para controlar el nivel de zoom del timeline
  const [zoomMode, setZoomMode] = useState<"day" | "week" | "month">("day");
  
  // 📏 Estado para el ancho dinámico del chart (importante para responsive design)
  const [chartWidth, setChartWidth] = useState(1000);
  
  // 📏 Estado para la altura dinámica del contenedor (límite de 8 tareas visibles)
  const [containerHeight, setContainerHeight] = useState(600);
  
  // 📏 Estado para la altura total del chart (todas las tareas)
  const [chartHeight, setChartHeight] = useState(360);

  // 🎯 Estados para manejar interactividad (tooltips, modales)
  const [tooltipData, setTooltipData] = useState<FormattedTask | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);

  // Optimizar el formateo de tareas con useMemo para evitar recálculos innecesarios
  const validTasks = useMemo(() => {
    // Datos de ejemplo para mostrar algo cuando no hay tareas reales
    const sampleTasks: FormattedTask[] = tasks.length === 0 ? [
      {
        id: 1,
        task_id: 1,
        name: "Análisis de biodiversidad inicial",
        detail: "Evaluación completa del estado actual de la biodiversidad en la finca",
        user: "Equipo Técnico",
        user_id: 1,
        organization: "Equipo Técnico",
        organization_id: 1,
        start: new Date('2024-01-15'),
        end: new Date('2024-02-15'),
        actualStart: new Date('2024-01-20'),
        actualEnd: null,
        phase: "Planning",
        status: "En progreso",
        product_id: 1
      },
      {
        id: 2,
        task_id: 2,
        name: "Implementación de prácticas sostenibles",
        detail: "Aplicación de técnicas de agricultura sostenible y conservación",
        user: "Productores Locales",
        user_id: 2,
        organization: "Productores Locales",
        organization_id: 2,
        start: new Date('2024-02-01'),
        end: new Date('2024-04-01'),
        actualStart: null,
        actualEnd: null,
        phase: "Elaboration",
        status: "Pendiente",
        product_id: 1
      },
      {
        id: 3,
        task_id: 3,
        name: "Monitoreo y evaluación",
        detail: "Seguimiento continuo del impacto de las prácticas implementadas",
        user: "Supervisores de Campo",
        user_id: 3,
        organization: "Supervisores de Campo",
        organization_id: 3,
        start: new Date('2024-03-15'),
        end: new Date('2024-06-15'),
        actualStart: null,
        actualEnd: null,
        phase: "Completion",
        status: "No iniciado",
        product_id: 1
      }
    ] : [];

    // Transformamos las tareas del backend al formato que necesita D3
    const formattedTasks = tasks.length > 0 ? tasks.map(t => {
      return {
        id: t.id,
        task_id: t.id,
        name: t.name,
        detail: t.detail,
        // Mantener el campo user para compatibilidad
        user: t.org_name && t.org_name.trim() !== '' 
          ? t.org_name 
          : (t.status_name || 'Estado no definido'),
        user_id: t.org_id,
        // 🆕 Campos específicos de organización
        organization: t.org_name && t.org_name.trim() !== '' 
          ? t.org_name 
          : 'Sin organización asignada',
        organization_id: t.org_id,
        start: t.start_planned ? new Date(t.start_planned) : null,
        end: t.end_planned ? new Date(t.end_planned) : null,
        actualStart: t.start_actual ? new Date(t.start_actual) : null,
        actualEnd: t.end_actual ? new Date(t.end_actual) : null,
        phase: t.phase_name || 'Sin fase',
        status: t.status_name || 'Sin estado',
        product_id: t.product_id,
        checkin_communication: t.checkin_communication,
        checkin_gender: t.checkin_gender,
        checkin_oro_verde: t.checkin_oro_verde,
        checkin_user: t.checkin_user,
      };
    }) : sampleTasks;

    // Filtramos solo las tareas que tienen fechas válidas
    return formattedTasks.filter(
      t => t.start instanceof Date && !isNaN(t.start.getTime()) && 
           t.end instanceof Date && !isNaN(t.end.getTime())
    );
  }, [tasks]);

  // 📏 Variable que se usará para la escala X (tiempo) - la declaramos aquí para usar en scrollToToday
  let x: d3.ScaleTime<number, number>;

  // 🎯 Función para hacer scroll automático a la fecha actual
  const scrollToToday = () => {
    console.log('🎯 scrollToToday: Iniciando...');
    
    // Verificar tareas válidas
    if (!validTasks.length) {
      console.log('⚠️ No hay tareas válidas');
      return;
    }
    
    // Verificar referencias DOM
    if (!verticalScrollRef.current || !headerScrollRef.current) {
      console.log('⚠️ Referencias DOM no disponibles');
      return;
    }
    
    // Recrear la escala X usando exactamente la misma lógica del useEffect
    const minStart = d3.min(validTasks, d => d.start!);
    const maxEnd = d3.max(validTasks, d => d.end!);
    const startDate = d3.timeMonday.floor(d3.timeDay.offset(minStart!, -21));
    const endDate = d3.timeMonday.ceil(d3.timeDay.offset(maxEnd!, 30));
    
    // Usar los mismos multiplicadores de zoom
    const zoomMultipliers: Record<string, number> = { 
      day: 30, week: 15, month: 8 
    };
    const dayWidth = zoomMultipliers[zoomMode];
    const totalDays = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
    const width = totalDays * dayWidth;
    
    // Crear la escala X exactamente como en el useEffect
    const xScale = d3.scaleTime()
      .domain([startDate, endDate])
      .range([0, width]);
    
    console.log('� Escala X creada:', {
      domain: [startDate.toLocaleDateString(), endDate.toLocaleDateString()],
      range: [0, width],
      zoomMode,
      dayWidth,
      totalDays: Math.round(totalDays),
      width
    });
    
    // STEP 4: Calcular offset de hoy
    const today = new Date();
    const todayOffset = xScale(today);
    
    console.log('📅 Información fecha actual:', {
      today: today.toLocaleDateString(),
      todayOffset: Math.round(todayOffset),
      isValidOffset: !isNaN(todayOffset) && isFinite(todayOffset)
    });
    
    // STEP 5: Verificar dominio
    const isInDomain = today >= startDate && today <= endDate;
    console.log('🔍 Verificación de dominio:', {
      isInDomain,
      daysDifferenceFromStart: Math.round((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)),
      daysDifferenceFromEnd: Math.round((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    });
    
    if (!isInDomain) {
      console.log('❌ ERROR: Fecha actual fuera del dominio');
      toast.warning('Fecha fuera de rango', {
        description: `La fecha actual está fuera del rango del proyecto (${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()})`,
        duration: 4000
      });
      return;
    }
    
    // STEP 6: Información del contenedor y scroll
    const containerWidth = verticalScrollRef.current.clientWidth;
    const currentScrollLeft = verticalScrollRef.current.scrollLeft;
    const scrollableWidth = verticalScrollRef.current.scrollWidth;
    const scrollPosition = Math.max(0, todayOffset - (containerWidth / 2));
    
    console.log('📦 Información del contenedor:', {
      containerWidth,
      currentScrollLeft,
      scrollableWidth,
      maxScrollLeft: scrollableWidth - containerWidth,
      calculatedScrollPosition: Math.round(scrollPosition),
      todayOffsetInChart: Math.round(todayOffset)
    });
    
    // STEP 7: Ejecutar scroll suave
    console.log('🚀 Ejecutando scroll suave hacia "hoy"...');
    
    // Función para animación suave personalizada
    const animateScroll = (element: HTMLElement, targetPosition: number, duration: number = 500) => {
      const startPosition = element.scrollLeft;
      const distance = targetPosition - startPosition;
      const startTime = performance.now();
      
      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Usar easing suave (ease-out cubic)
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const currentPosition = startPosition + (distance * easeOut);
        
        element.scrollLeft = currentPosition;
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      
      requestAnimationFrame(animate);
    };
    
    console.log('ANTES del scroll:', {
      verticalScrollLeft: verticalScrollRef.current.scrollLeft,
      headerScrollLeft: headerScrollRef.current.scrollLeft,
      targetPosition: Math.round(scrollPosition)
    });
    
    // Animar scroll en ambos contenedores simultáneamente
    animateScroll(verticalScrollRef.current, scrollPosition, 800); // 800ms para suavidad
    animateScroll(headerScrollRef.current, scrollPosition, 800);
    
    console.log('✅ Animación de scroll iniciada hacia "hoy"');
  };

  // Función para sincronizar scroll vertical entre paneles
  const syncVerticalScroll = (scrollTop: number) => {
    // Sincroniza el scroll vertical del panel izquierdo con el derecho
    if (fixedRef.current && fixedRef.current.parentElement) {
      // Transformar el SVG del panel izquierdo para que se mueva con el scroll
      const transform = `translateY(${-scrollTop}px)`;
      fixedRef.current.style.transform = transform;
    }
  };

  // useEffect - aquí es donde ocurre toda la magia de D3
  // Se ejecuta cada vez que cambian las tareas válidas o el modo de zoom
  useEffect(() => {
    // Early return si no hay tareas válidas - D3 no puede dibujar sin datos
    if (!validTasks.length) return;

    // PASO 1: Definir las dimensiones básicas del chart
    const rowHeight = 45;
    const maxVisibleTasks = 8;
    
    // Calcular alturas basadas en el límite de tareas visibles
    const totalTasks = validTasks.length;
    const chartHeight = totalTasks * rowHeight;
    
    // Altura del contenedor: fija para 8 tareas cuando hay más, dinámica cuando hay menos
    const containerHeight = totalTasks <= maxVisibleTasks 
      ? chartHeight + 140
      : (maxVisibleTasks * rowHeight) + 140;

    // 📅 PASO 2: Calcular el rango de fechas del timeline
    // d3.min y d3.max son funciones agregadas que encuentran valores extremos
    const minStart = d3.min(validTasks, d => d.start!); // Fecha de inicio más temprana
    const maxEnd = d3.max(validTasks, d => d.end!);     // Fecha de fin más tardía
    
    // 📆 Expandimos el rango para dar contexto visual
    // d3.timeMonday.floor() redondea hacia abajo al lunes más cercano
    // d3.timeDay.offset() suma/resta días a una fecha
    const startDate = d3.timeMonday.floor(d3.timeDay.offset(minStart!, -21)); // 3 semanas antes
    const endDate = d3.timeMonday.ceil(d3.timeDay.offset(maxEnd!, 30));        // 30 días después

    // 🔍 PASO 3: Calcular el ancho del chart basado en el nivel de zoom
    const zoomMultipliers: Record<string, number> = { 
      day: 30,    // 30px por día (más detallado)
      week: 15,   // 15px por día (intermedio)
      month: 8    // 8px por día (más compacto)
    };
    const dayWidth = zoomMultipliers[zoomMode];
    const totalDays = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
    const calculatedWidth = totalDays * dayWidth;
    
    // 📱 PASO 4: Hacer el chart responsive - pero mantenemos el ancho calculado del zoom
    // En lugar de limitar el ancho máximo, permitimos que el chart se expanda según el zoom
    const width = calculatedWidth; // Usamos directamente el ancho calculado por el zoom
    
    // 💾 Guardamos el ancho en el estado para usar en el renderizado
    setChartWidth(width);
    
    // 💾 Guardamos la altura del contenedor (limitada a 8 tareas + header)
    setContainerHeight(containerHeight);
    
    // 💾 Guardamos la altura total del chart (todas las tareas + header)
    setChartHeight(chartHeight);

    // 📏 PASO 5: Crear las ESCALAS de D3 - esto es fundamental en D3
    // Las escalas mapean datos (fechas, nombres) a coordenadas en pantalla (píxeles)
    
    // 🕐 Escala X (horizontal) - mapea fechas a posiciones horizontales
    // eslint-disable-next-line react-hooks/exhaustive-deps
    x = d3.scaleTime()
      .domain([startDate, endDate])  // Dominio: rango de fechas de entrada
      .range([0, width]);            // Rango: píxeles de salida (0 a ancho del chart)

    // 📊 PASO 6: Preparar y ordenar los datos para visualización
    // Ordenamos las tareas por fecha de inicio para un mejor layout visual
    const sortedByPlannedStart = [...validTasks].sort((a, b) => {
      const diff = a.start!.getTime() - b.start!.getTime(); // Primer criterio: fecha de inicio
      if (diff !== 0) return diff;
      const endDiff = (a.end!.getTime() - b.end!.getTime()); // Segundo criterio: fecha de fin
      if (endDiff !== 0) return endDiff;
      return a.name.localeCompare(b.name); // Tercer criterio: nombre alfabético
    });

    // 📏 Escala Y (vertical) - mapea nombres de tareas a posiciones verticales
    // scaleBand es perfecta para datos categóricos (nombres de tareas)
    const y = d3.scaleBand()
      .domain(sortedByPlannedStart.map(d => d.name)) // Dominio: nombres de las tareas
      .range([0, chartHeight])                       // Rango: píxeles verticales
      .padding(0.2);                                 // Espaciado entre barras (20%)

    // 🎨 PASO 7: Configurar el SVG principal (timeline)
    // d3.select() es como querySelector pero para D3
    // ===============================
    // 📅 CREAR HEADER FIJO (timeline)
    // ===============================
    const headerSvg = d3.select(headerTimelineRef.current);
    headerSvg.selectAll("*").remove(); // Limpiar contenido previo
    headerSvg.attr("width", width).attr("height", 140); // Header fijo de 140px
    
    const header = headerSvg.append("g").attr("transform", `translate(0,30)`);
    
    // ===============================
    // 📊 CREAR SVG DE CONTENIDO (solo tareas)
    // ===============================
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Limpiar contenido previo  
    svg.attr("width", width).attr("height", chartHeight); // Solo altura del contenido, sin header
    
    // Grupo para el contenido principal (sin offset porque no hay header aquí)
    const g = svg.append("g");
    
    // 🔍 Determinar intervalos de tiempo basados en el modo de zoom
    let timeIntervals: Date[];
    
    switch (zoomMode) {
      case "day":
        timeIntervals = d3.timeDay.range(startDate, endDate);
        break;
      case "week":
        timeIntervals = d3.timeMonday.range(startDate, endDate);
        break;
      case "month":
        timeIntervals = d3.timeMonth.range(startDate, endDate);
        break;
      default:
        timeIntervals = d3.timeMonday.range(startDate, endDate);
    }
    
    // Para compatibilidad con el código existente, mantenemos 'weeks' pero ahora representa los intervalos según el zoom
    const weeks = timeIntervals;
    
    // Para el header de meses, necesitamos una lógica específica según el zoom
    let monthGroups: [string, Date[]][];
    if (zoomMode === "month") {
      // En modo mes, agrupamos por año
      monthGroups = d3.groups(weeks, d => d.getFullYear().toString());
    } else {
      // En modo día y semana, agrupamos por mes como antes
      monthGroups = d3.groups(weeks, d => d.getFullYear() + "-" + d.getMonth());
    }

    // Definiciones de patrones para rayado (actualHatch y checkinHatch)
    const defs = svg.append("defs");

    defs.append("pattern")
      .attr("id", "actualHatch")
      .attr("patternUnits", "userSpaceOnUse")
      .attr("width", 8)
      .attr("height", 8)
      .append("path")
      .attr("d", "M-2,2 l4,-4 M0,8 l8,-8 M6,10 l4,-4")
      .attr("stroke", "#1F2B48")
      .attr("stroke-width", 2)
      .attr("opacity", 0.35);

    defs.append("pattern")
      .attr("id", "checkinHatch")
      .attr("patternUnits", "userSpaceOnUse")
      .attr("width", 8)
      .attr("height", 8)
      .append("path")
      .attr("d", "M-2,2 l4,-4 M0,8 l8,-8 M6,10 l4,-4")
      .attr("stroke", "#CB1973")
      .attr("stroke-width", 2)
      .attr("opacity", 0.45);

    // 📅 Header de meses (línea gris horizontal oscuro)
    monthGroups.forEach(([, days]) => {
      const xStart = x(days[0]);
      let xEnd: number;
      let labelText: string;
      
      // Calcular el ancho y la etiqueta según el modo de zoom
      switch (zoomMode) {
        case "day":
        case "week":
          // Para día y semana, agrupamos por mes
          xEnd = x(d3.timeDay.offset(days[days.length - 1], 7));
          labelText = days[0].toLocaleString("en", { month: "long" });
          break;
        case "month":
          // Para mes, agrupamos por año y usamos un rango más amplio
          xEnd = x(d3.timeYear.offset(days[0], 1)); // Un año completo
          labelText = days[0].getFullYear().toString();
          break;
        default:
          xEnd = x(d3.timeDay.offset(days[days.length - 1], 7));
          labelText = days[0].toLocaleString("en", { month: "long" });
      }

      header.append("rect")
        .attr("x", xStart)
        .attr("y", 0)
        .attr("width", xEnd - xStart)
        .attr("height", 20)
        .attr("fill", "#6b7280"); // gris oscuro

      header.append("text")
        .attr("x", xStart + 4)
        .attr("y", 15)
        .text(labelText)
        .attr("class", "text-xs font-bold fill-white");

      // Línea vertical de separación de meses
      header.append("line")
        .attr("x1", xStart)
        .attr("x2", xStart)
        .attr("y1", 0)
        .attr("y2", 115)
        .attr("stroke", "#374151")
        .attr("stroke-width", 2);
    });

    // 📅 Header de semanas/días/meses (debajo de los meses)
    weeks.forEach((d) => {
      const xStart = x(d);
      let labelText: string;
      let subLabelText: string;
      
      switch (zoomMode) {
        case "day":
          labelText = d3.timeFormat("%d")(d); // Día del mes
          subLabelText = d3.timeFormat("%a")(d); // Día de la semana (Mon, Tue, etc.)
          break;
        case "week":
          const weekNumber = d3.timeFormat("%U")(d);
          labelText = `W${+weekNumber + 1}`;
          subLabelText = d3.timeFormat("%d/%m/%y")(d);
          break;
        case "month":
          labelText = d3.timeFormat("%b")(d); // Nombre del mes (Jan, Feb, etc.)
          subLabelText = d3.timeFormat("%Y")(d); // Año
          break;
        default:
          const weekNum = d3.timeFormat("%U")(d);
          labelText = `W${+weekNum + 1}`;
          subLabelText = d3.timeFormat("%d/%m/%y")(d);
      }

      // Etiqueta principal
      header.append("text")
        .attr("x", xStart + 4)
        .attr("y", 35)
        .text(labelText)
        .attr("class", "text-xs fill-gray-600 font-medium");

      // Etiqueta secundaria
      header.append("text")
        .attr("x", xStart + 4)
        .attr("y", 50)
        .text(subLabelText)
        .attr("class", "text-xs fill-gray-600");

      // Líneas verticales según el modo de zoom (días/semanas/meses)
      header.append("line")
        .attr("x1", xStart)
        .attr("x2", xStart)
        .attr("y1", 20)
        .attr("y2", 115)
        .attr("stroke", "#d1d5db")
        .attr("stroke-width", 1);
    });

    // 📅 Header de fases (mapeo respecto a las tareas)
    const phaseGroups = d3.groups(validTasks, d => d.phase);
    phaseGroups.forEach(([phase, group]) => {
      const phaseStart = d3.min(group, d => d.start!);
      const phaseEnd = d3.max(group, d => d.end!);

      header.append("rect")
        .attr("x", x(phaseStart!))
        .attr("y", 65)
        .attr("width", x(phaseEnd!) - x(phaseStart!))
        .attr("height", 20)
        .attr("fill", phaseColors[phase as keyof typeof phaseColors] || "#ccc")
        .attr("rx", 4);

      header.append("text")
        .attr("x", (x(phaseStart!) + x(phaseEnd!)) / 2)
        .attr("y", 80)
        .text(phase)
        .attr("class", "text-xs font-bold fill-black")
        .attr("text-anchor", "middle");
    });

    // Línea horizontal de separación entre header y contenido
    header.append("line")
      .attr("x1", 0)
      .attr("x2", width)
      .attr("y1", 115)
      .attr("y2", 115)
      .attr("stroke", "#374151")
      .attr("stroke-width", 2);

    // 🎨 PASO 10: Crear filas de fondo para mejor legibilidad
    // Alternamos colores entre filas para facilitar la lectura
    g.selectAll("rect.row-bg")     // Seleccionamos rectángulos para fondo
      .data(validTasks)            // Un rectángulo por tarea
      .enter()
      .append("rect")
      .attr("x", 0)                // Empezar desde el borde izquierdo
      .attr("y", d => y(d.name)!)  // Posición Y basada en la escala Y
      .attr("width", width)        // Ancho completo del chart
      .attr("height", y.bandwidth()) // Altura = ancho de banda de la escala Y
      .attr("fill", (d, i) => i % 2 === 0 ? "#f8fafc" : "#ffffff") // Alternar colores
      .style("opacity", 0.5);      // Semi-transparente para no interferir

    // 📏 PASO 11: Crear líneas de grilla vertical (marcadores de tiempo)
    // Estas líneas ayudan a leer las fechas en el timeline y se ajustan dinámicamente al modo de zoom
    let gridTicks: Date[];
    switch (zoomMode) {
      case "day":
        gridTicks = x.ticks(d3.timeDay.every(1)!);
        break;
      case "week":
        gridTicks = x.ticks(d3.timeMonday.every(1)!);
        break;
      case "month":
        gridTicks = x.ticks(d3.timeMonth.every(1)!);
        break;
      default:
        gridTicks = x.ticks(d3.timeMonday.every(1)!);
    }
    
    g.selectAll("line.time-grid")
      .data(gridTicks)             // Usamos ticks dinámicos basados en el zoom
      .enter()
      .append("line")              // Elemento <line> de SVG
      .attr("x1", d => x(d))       // Posición X de inicio (convertir fecha a píxel)
      .attr("x2", d => x(d))       // Posición X de fin (misma que inicio = línea vertical)
      .attr("y1", 0)               // Y de inicio (arriba del contenido)
      .attr("y2", chartHeight)     // Y de fin (abajo del contenido)
      .attr("stroke", "#d1d5db")   // Color de la línea (mismo que en el header)
      .attr("stroke-width", 1)     // Grosor de la línea
      .attr("stroke-dasharray", "2,2") // Línea punteada para diferenciarse
      .style("opacity", 0.6);      // Semi-transparente

    // 📏 PASO 12: Líneas de grilla principales de meses (más prominentes)
    // Estas líneas conectan las separaciones de meses desde el header hasta el contenido
    monthGroups.forEach(([, days]) => {
      const xStart = x(days[0]);
      
      // Línea principal de mes en el contenido
      g.append("line")
        .attr("x1", xStart)
        .attr("x2", xStart)
        .attr("y1", 0)
        .attr("y2", chartHeight)
        .attr("stroke", "#374151")   // Color más oscuro para líneas de mes
        .attr("stroke-width", 1.5);  // Más gruesas que las de semana
    });

    // 📏 PASO 13: Crear líneas horizontales de las tareas
    // Estas líneas proporcionan una base visual para cada tarea
    g.selectAll("line.task-lines")
      .data(validTasks)
      .enter()
      .append("line")
      .attr("x1", -250)            // Extiende más allá del panel izquierdo
      .attr("x2", width)           // Hasta el final del chart
      .attr("y1", d => y(d.name)! + y.bandwidth()) // En la parte inferior de cada fila
      .attr("y2", d => y(d.name)! + y.bandwidth())
      .attr("stroke", "#d1d5db")   // Color gris claro
      .attr("stroke-width", 1);

    // 🎯 PASO 14: Crear las barras principales del Gantt (LO MÁS IMPORTANTE!)
    // Aquí es donde se visualizan realmente las tareas como barras horizontales
    g.selectAll("rect.task-bar")
      .data(validTasks)            // Una barra por tarea válida
      .enter()
      .append("rect")              // Elemento <rect> de SVG
      .attr("x", d => x(d.start!)) // Posición X = fecha de inicio convertida a píxeles
      .attr("y", d => y(d.name)! + y.bandwidth() * 0.15) // Y con un pequeño padding
      .attr("width", d => x(d.end!) - x(d.start!))        // Ancho = diferencia entre fechas
      .attr("height", y.bandwidth() * 0.7)                // Altura = 70% del espacio disponible
      .attr("rx", 6)               // Bordes redondeados (radio = 6px)
      .attr("fill", d => phaseColors[d.phase as keyof typeof phaseColors] || "#ccc") // Color por fase
      .style("cursor", "pointer")  // Cambiar cursor al pasar el mouse
      .style("pointer-events", "all") // 🔥 Asegurar que reciba eventos de mouse
      .style("filter", "drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))") // Sombra sutil
      // 🎯 Event handlers - exactamente como el código original
      .on("click", function(event, d) { // Al hacer clic...
        event.stopPropagation(); // Evitar que se propague el evento
        setSelectedTaskId(d.task_id);
        setIsTaskModalOpen(true);  // ...abrir modal de detalles
      })
      .on("mouseover", function (event, d) { 
        setTooltipData(d); 
      })
      .on("mousemove", function (event) {
        const tooltipWidth = 300; // Reducido para mejor ajuste
        const tooltipHeight = 200; // Reducido para mejor ajuste
        let mouseX = event.clientX + 15; // Menos offset para estar más cerca
        let mouseY = event.clientY - 10; // Pequeño offset hacia arriba
        
        // Ajustar posición si se sale de la pantalla
        if (mouseX + tooltipWidth > window.innerWidth) {
          mouseX = event.clientX - tooltipWidth - 15; // Mostrar a la izquierda si no cabe
        }
        if (mouseY < 0) {
          mouseY = event.clientY + 20; // Mostrar abajo si se sale por arriba
        }
        if (mouseY + tooltipHeight > window.innerHeight) {
          mouseY = window.innerHeight - tooltipHeight - 10;
        }
        
        setTooltipPos({ x: mouseX, y: mouseY });
      })
      .on("mouseleave", function () {
        // Dar un pequeño delay antes de cerrar para permitir hover en el tooltip
        setTimeout(() => {
          const tooltipElement = document.querySelector("#tooltip-hover");
          if (!tooltipElement || !tooltipElement.matches(":hover")) {
            setTooltipData(null);
          }
        }, 100);
      });

    // � PASO 15: Overlay de duración real (barras rayadas)
    // Estas barras se superponen a las barras principales para mostrar el progreso real
    g.selectAll("rect.actual-bar")
      .data(
        validTasks.filter(
          d =>
            d.actualStart instanceof Date && !isNaN(d.actualStart.getTime()) &&
            d.actualEnd instanceof Date && !isNaN(d.actualEnd.getTime())
        )
      )
      .enter()
      .append("rect")
      .attr("class", "actual-bar")
      .attr("x", d => x(d.actualStart!))
      .attr("y", d => y(d.name)! + y.bandwidth() * 0.15)
      .attr("width", d => Math.max(0, x(d.actualEnd!) - x(d.actualStart!)))
      .attr("height", y.bandwidth() * 0.7)
      .attr("rx", 6)
      .attr("fill", "url(#actualHatch)")
      .attr("stroke", "#1F2B48")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "6,4")
      .style("cursor", "pointer")
      .style("pointer-events", "all") // 🔥 Asegurar que reciba eventos de mouse
      .on("click", function(event, d) { // Al hacer clic en barra de duración real...
        event.stopPropagation(); // Evitar que se propague el evento
        setSelectedTaskId(d.task_id);
        setIsTaskModalOpen(true);  // ...abrir modal de detalles
      })
      .on("mouseover", (event, d) => { setTooltipData(d); })
      .on("mousemove", function (event) {
        const tooltipWidth = 300; // Reducido para mejor ajuste
        const tooltipHeight = 200; // Reducido para mejor ajuste
        let mouseX = event.clientX + 15; // Menos offset para estar más cerca
        let mouseY = event.clientY - 10; // Pequeño offset hacia arriba
        
        // Ajustar posición si se sale de la pantalla
        if (mouseX + tooltipWidth > window.innerWidth) {
          mouseX = event.clientX - tooltipWidth - 15; // Mostrar a la izquierda si no cabe
        }
        if (mouseY < 0) {
          mouseY = event.clientY + 20; // Mostrar abajo si se sale por arriba
        }
        if (mouseY + tooltipHeight > window.innerHeight) {
          mouseY = window.innerHeight - tooltipHeight - 10;
        }
        
        setTooltipPos({ x: mouseX, y: mouseY });
      })
      .on("mouseleave", () => {
        // Dar un pequeño delay antes de cerrar para permitir hover en el tooltip
        setTimeout(() => {
          const tooltipElement = document.querySelector("#tooltip-hover");
          if (!tooltipElement || !tooltipElement.matches(":hover")) {
            setTooltipData(null);
          }
        }, 100);
      });

    // 📋 PASO 16: Check-ins (marcadores de revisión)
    // Pequeñas barras rayadas que indican fechas de check-in
    const oneDayMs = 24 * 60 * 60 * 1000;
    const checkins: Array<{ task: string; y: number; date: Date }> = [];
    validTasks.forEach(d => {
      const candidates = [
        d.checkin_communication,
        d.checkin_gender,
        d.checkin_oro_verde,
        d.checkin_user,
      ].filter(Boolean);

      candidates.forEach(c => {
        if (c && typeof c === 'string') {
          const dt = new Date(c);
          if (dt instanceof Date && !isNaN(dt.getTime())) {
            checkins.push({ task: d.name, y: y(d.name)!, date: dt });
          }
        }
      });
    });

    g.selectAll("rect.checkin")
      .data(checkins)
      .enter()
      .append("rect")
      .attr("class", "checkin")
      .attr("x", d => x(d.date))
      .attr("y", d => d.y + y.bandwidth() * 0.2)
      .attr("width", d => Math.max(2, x(new Date(d.date.getTime() + oneDayMs)) - x(d.date)))
      .attr("height", y.bandwidth() * 0.6)
      .attr("rx", 10)
      .attr("fill", "url(#checkinHatch)")
      .attr("stroke", "#CB1973")
      .attr("stroke-width", 2)
      .attr("pointer-events", "none");

    // �📍 PASO 17: Agregar indicador de "HOY" (estilo original)
    // Línea vertical que marca la fecha actual en el timeline
    const today = new Date();
    const todayX = x(today);          // Convertir fecha actual a posición X
    
    // Línea vertical principal de "Today"
    g.append("line")
      .attr("x1", todayX)
      .attr("x2", todayX)
      .attr("y1", 0)                  // Desde arriba del contenido
      .attr("y2", chartHeight)        // Hasta abajo del contenido
      .attr("stroke", "#CB1973")      // Color rosa como en el original
      .attr("stroke-width", 2)        // Línea gruesa
      .attr("stroke-dasharray", "4,2"); // Línea punteada

    // Etiqueta de texto "Today"
    g.append("text")
      .attr("x", todayX + 4)
      .attr("y", -10)
      .text(`Today (${d3.timeFormat("%d/%m/%Y")(today)})`)
      .attr("class", "text-xs text-gray-800 font-semibold");

    // ===============================
    // 🏷️ CREAR HEADER IZQUIERDO (etiquetas)
    // ===============================
    const headerLeftSvg = d3.select(headerLeftRef.current);
    headerLeftSvg.selectAll("*").remove(); // Limpiar contenido previo
    headerLeftSvg.attr("width", 249.5).attr("height", 140); // Header fijo de 140px
    
    // Fondo de la sección "Month" (alineado con el header de meses del timeline)
    headerLeftSvg.append("rect")
      .attr("x", 0)
      .attr("y", 30)
      .attr("width", 249.5)
      .attr("height", 20)
      .attr("fill", "#6b7280"); // Mismo color que el header de meses
    
    // Texto dinámico para el header superior según el zoom
    let topHeaderLabel: string;
    switch (zoomMode) {
      case "day":
      case "week":
        topHeaderLabel = "Month";
        break;
      case "month":
        topHeaderLabel = "Year";
        break;
      default:
        topHeaderLabel = "Month";
    }
    
    headerLeftSvg.append("text")
      .attr("x", 10)
      .attr("y", 45)
      .text(topHeaderLabel)
      .attr("class", "text-xs font-bold fill-white");
    
    // Etiquetas para las filas de semanas/días/meses (dinámicas según el zoom)
    let leftHeaderLabels: string[];
    switch (zoomMode) {
      case "day":
        leftHeaderLabels = ["Day", "Date"];
        break;
      case "week":
        leftHeaderLabels = ["Week", "Starts"];
        break;
      case "month":
        leftHeaderLabels = ["Month", "Year"];
        break;
      default:
        leftHeaderLabels = ["Week", "Starts"];
    }
    
    leftHeaderLabels.forEach((label, i) => {
      headerLeftSvg.append("text")
        .attr("x", 10)
        .attr("y", i * 15 + 65) // Y = 65, 80 (alineado con el header de semanas/días)
        .text(label)
        .attr("class", "text-xs fill-gray-600");
    });
    
    // Fondo de la sección "Phase" (alineado con el header de fases del timeline)
    headerLeftSvg.append("rect")
      .attr("x", 0)
      .attr("y", 85)
      .attr("width", 249.5)
      .attr("height", 20)
      .attr("fill", "#f3f4f6"); // Fondo gris claro
    
    // Texto "Phase"
    headerLeftSvg.append("text")
      .attr("x", 10)
      .attr("y", 100)
      .text("Phase")
      .attr("class", "text-xs font-bold fill-gray-800");
    
    // Línea horizontal de separación (alineada con la del timeline)
    headerLeftSvg.append("line")
      .attr("x1", 0)
      .attr("x2", 249.5)
      .attr("y1", 115) // Ajustado para el header de 140px
      .attr("y2", 115)
      .attr("stroke", "#374151")
      .attr("stroke-width", 2);

    // ===============================
    // 📋 CREAR PANEL IZQUIERDO (solo tareas)
    // ===============================
    const leftSVG = d3.select(fixedRef.current);
    leftSVG.selectAll("*").remove();  // Limpiar contenido previo
    leftSVG.attr("width", 249.5).attr("height", chartHeight); // Solo altura del contenido, sin header
    
    // Grupo para el contenido del panel izquierdo (sin offset porque no hay header aquí)
    const gLeft = leftSVG.append("g");
    
    // 🎨 PASO 16: Fondo alternado para el panel izquierdo
    // Mantener consistencia visual con el panel principal
    gLeft.selectAll("rect.left-row-bg")
      .data(validTasks)
      .enter()
      .append("rect")
      .attr("x", 0)
      .attr("y", d => y(d.name)!)       // Usar la misma escala Y
      .attr("width", 249.5)             // Ancho fijo del panel izquierdo
      .attr("height", y.bandwidth())    // Misma altura que las filas principales
      .attr("fill", (d, i) => i % 2 === 0 ? "#f8fafc" : "#ffffff") // Alternar colores
      .style("opacity", 0.5);
    
    // 📝 PASO 17: Nombres de las tareas (clickeables)
    gLeft.selectAll("text.task-name")
      .data(validTasks)
      .enter()
      .append("text")
      .attr("x", 15)                    // Padding desde el borde izquierdo
      .attr("y", d => y(d.name)! + y.bandwidth() / 2 + 4) // Centrado verticalmente
      .text(d => d.name.length > 25 ? `${d.name.slice(0, 25)}...` : d.name) // Truncar si es muy largo
      .attr("fill", "#1e293b")          // Color del texto
      .attr("font-size", "13px")
      .attr("font-weight", "500")       // Semi-bold
      .style("cursor", "pointer")       // Indicar que es clickeable
      .on("click", (event, d) => {      // Al hacer clic en el nombre...
        setSelectedTaskId(d.task_id);   // ...también abrir modal de detalles
        setIsTaskModalOpen(true);
      });

    // 👥 PASO 18: Información adicional (estado de la tarea)
    // Texto secundario debajo del nombre de la tarea
    gLeft.selectAll("text.task-user")
      .data(validTasks)
      .enter()
      .append("text")
      .attr("x", 15)                    // Mismo padding que el nombre
      .attr("y", d => y(d.name)! + y.bandwidth() / 2 + 18) // Debajo del nombre
      .text(d => {
        const orgText = d.organization.length > 20 ? `${d.organization.slice(0, 20)}...` : d.organization;
        return `${orgText}`; // Solo el nombre de la organización
      })
      .attr("fill", "#64748b")          // Color más suave (gris)
      .attr("font-size", "11px");       // Fuente más pequeña

    // 🔄 SINCRONIZACIÓN DE SCROLL: Agregar event listener para sincronizar paneles
    const handleScroll = () => {
      if (verticalScrollRef.current) {
        const scrollTop = verticalScrollRef.current.scrollTop;
        syncVerticalScroll(scrollTop);
      }
    };

    // Capturar la referencia para el cleanup
    const scrollContainer = verticalScrollRef.current;
    
    // Agregar listener de scroll
    scrollContainer?.addEventListener('scroll', handleScroll);

    // 🧹 Cleanup: Remover listener al desmontar
    return () => {
      scrollContainer?.removeEventListener('scroll', handleScroll);
    };

  }, [validTasks, zoomMode]); // Dependencias del useEffect

  // FUNCIONES DE MANEJO DE MODALES Y EVENTOS
  const closeTaskModal = () => {
    setIsTaskModalOpen(false);
    setSelectedTaskId(null);
  };

  const handleTaskComplete = () => {
    refreshData();        // Refrescar datos desde el backend
    setIsAddTaskOpen(false); // Cerrar modal de creación
  };

  const handleTaskCancel = () => {
    setIsAddTaskOpen(false); // Cerrar modal de creación
  };

  // 🎨 RENDERIZADO DEL COMPONENTE
  return (
    <>
      <div className="bg-card rounded-lg border shadow-sm w-full overflow-hidden" style={{ maxWidth: "100%" }}>
      
      {/* 🎯 HEADER: Leyenda de fases y controles de zoom */}
      <div className="border-b px-6 py-0 bg-muted/30 flex justify-between items-center h-12">{/* Eliminado py completamente y agregado altura fija */}
        
        {/* 🎨 Leyenda de colores por fase */}
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-muted-foreground">Fases:</span>
          {Object.entries(phaseColors).map(([phase, color]) => (
            <div key={phase} className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-sm" 
                style={{ backgroundColor: color }}
              ></div>
              <span className="text-sm text-foreground">{phase}</span>
            </div>
          ))}
        </div>
        
        {/* 🎮 Controles de navegación y zoom */}
        <div className="flex items-center space-x-2">
          
          
          {/* 🎯 Botón para ir a "Hoy" */}
          <button 
            onClick={scrollToToday} 
            className="px-3 py-2 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Hoy
          </button>

          {/* 🔍 Controles de zoom temporal */}
          <div className="flex rounded-md border bg-background">
            <button
              onClick={() => setZoomMode("day")}
              className={`px-3 py-2 text-sm rounded-l-md transition-colors ${
                zoomMode === "day" 
                  ? "bg-primary text-primary-foreground" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              Día
            </button>

            <button
              onClick={() => setZoomMode("week")}
              className={`px-3 py-2 text-sm border-x transition-colors ${
                zoomMode === "week" 
                  ? "bg-primary text-primary-foreground" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
                Semana
              </button>

              <button
                onClick={() => setZoomMode("month")}
                className={`px-3 py-2 text-sm rounded-r-md transition-colors ${
                  zoomMode === "month" 
                    ? "bg-primary text-primary-foreground" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                Mes
              </button>
            </div>
          </div>
      </div>
      
      {/* 📊 CONTENEDOR PRINCIPAL DEL GANTT */}
      {/* 🎯 LÍMITE DE 8 TAREAS VISIBLES - Scroll vertical para tareas adicionales */}
      
      {/* 
      🎯 ALTURA DINÁMICA: 
      - Si hay ≤ 8 tareas: altura ajustada al contenido
      - Si hay > 8 tareas: altura fija + scroll vertical
      
      🔧 FIXES APLICADOS PARA EL SCROLL:
      1. containerHeight: Altura fija del contenedor (8 tareas max)
      2. SVG height: Altura completa (todas las tareas) para permitir scroll
      3. overflow-y-auto: Solo en el contenedor padre, no en paneles hijos
      4. Estados separados: containerHeight vs chartHeight
      5. 🆕 Contenido sincronizado: Un solo elemento scrolleable con ambos paneles
      */}
      <div className="flex flex-col h-full bg-white relative" style={{ margin: "0", padding: "0" }}>
        
        {/* 📅 HEADER FIJO - No se mueve con scroll vertical */}
        <div className="flex w-full bg-white border-b border-gray-200 sticky top-0 z-10" style={{ height: "140px", margin: "0", padding: "0" }}>
          {/* Header del panel izquierdo */}
          <div className="bg-muted/30 border-r flex-shrink-0" style={{ width: "230px", height: "140px" }}>
            <svg ref={headerLeftRef} style={{ width: "100%", height: "140px" }}></svg>
          </div>
          
          {/* Header del timeline */}
          <div 
            className="flex-1 overflow-hidden" 
            style={{ maxWidth: "calc(100vw - 350px)", height: "140px" }}
          >
            <div 
              ref={headerScrollRef}
              className="w-full h-full overflow-x-auto hide-scrollbar"
              style={{ 
                scrollbarWidth: "none", /* Firefox */
                msOverflowStyle: "none",  /* Internet Explorer 10+ */
                paddingBottom: '0px',
                marginBottom: '-17px'
              }}
              onScroll={(e) => {
                // Sincronizar scroll horizontal del header con el contenido
                if (verticalScrollRef.current) {
                  verticalScrollRef.current.scrollLeft = e.currentTarget.scrollLeft;
                }
              }}
            >
              <svg ref={headerTimelineRef} style={{ width: `${chartWidth}px`, height: "140px", maxWidth: "none" }}></svg>
            </div>
          </div>
        </div>

        {/* 📊 ÁREA DE CONTENIDO SCROLLEABLE - Solo las tareas se mueven */}
        <div 
          className="flex w-full flex-1 overflow-hidden"
          style={{ 
            height: `${containerHeight - 140}px`, 
            maxHeight: `${containerHeight - 140}px` 
          }}
        >
          {/* Panel izquierdo de tareas */}
          <div className="bg-muted/30 border-r flex-shrink-0 overflow-hidden" style={{ width: "230px" }}>
            <svg ref={fixedRef} style={{ width: "100%", height: `${chartHeight}px` }}></svg>
          </div>
          
          {/* Panel derecho de tareas con scroll sincronizado */}
          <div 
            ref={verticalScrollRef}
            className="flex-1 overflow-auto" 
            style={{ 
              maxWidth: "calc(100vw - 350px)"
            }}
            onScroll={(e) => {
              // Sincronizar scroll horizontal del contenido con el header
              if (headerScrollRef.current) {
                headerScrollRef.current.scrollLeft = e.currentTarget.scrollLeft;
              }
            }}
          >
            <svg ref={svgRef} style={{ width: `${chartWidth}px`, height: `${chartHeight}px`, maxWidth: "none" }}></svg>
          </div>
          
          {/* CSS local para ocultar scrollbars solo del header */}
          <style jsx>{`
            .hide-scrollbar {
              scrollbar-width: none; /* Firefox */
              -ms-overflow-style: none; /* Internet Explorer 10+ */
            }
            
            .hide-scrollbar::-webkit-scrollbar {
              display: none; /* WebKit */
              width: 0 !important;
              height: 0 !important;
            }
            
            .hide-scrollbar::-webkit-scrollbar-track {
              display: none;
            }
            
            .hide-scrollbar::-webkit-scrollbar-thumb {
              display: none;
            }
          `}</style>
        </div>
      </div>

      {/* 
      💡 ALTERNATIVAS DE SCROLL VERTICAL:
      
      🔄 OPCIÓN 2: Solo en el área de contenido (sin header de fechas)
      <div style={{ height: "140px" }}> // Header fijo 
        <svg>Header de fechas</svg>
      </div>
      <div className="overflow-y-auto" style={{ height: "460px" }}>
        <div className="flex">
          <div>Panel izquierdo</div>
          <div className="overflow-x-auto">Panel derecho</div>
        </div>
      </div>
      
      🔄 OPCIÓN 3: Scroll independiente en cada panel
      <div className="flex">
        <div className="overflow-y-auto">Panel izquierdo</div>
        <div className="overflow-auto">Panel derecho (X + Y)</div>
      </div>
      
      🔄 OPCIÓN 4: Scroll con sticky header
      <div className="overflow-y-auto">
        <div className="sticky top-0">Header de fechas</div>
        <div className="flex">Contenido scrolleable</div>
      </div>

      {/* 💬 TOOLTIP: Información que aparece al pasar el mouse sobre las barras */}
      {tooltipData && (
        <div 
          id="tooltip-hover"
          className="fixed z-50 bg-white border border-gray-300 rounded-lg shadow-lg p-3 text-sm"
          style={{ 
            left: tooltipPos.x,    // Posición X exacta del mouse
            top: tooltipPos.y,     // Posición Y exacta del mouse
            pointerEvents: 'auto',  // Permitir eventos del mouse para el hover
            minWidth: '200px',     // Ancho mínimo
            maxWidth: '300px'      // Ancho máximo
          }}
          onMouseEnter={() => {
            // Mantener el tooltip visible cuando el mouse está sobre él
          }}
          onMouseLeave={() => {
            // Cerrar el tooltip cuando el mouse sale de él
            setTooltipData(null);
          }}
        >
          <div className="space-y-1">
            <p className="font-semibold text-sm text-foreground">{tooltipData.name}</p>
            <p className="text-xs text-muted-foreground">
              <span className="font-medium">Estado:</span> {tooltipData.status}
            </p>
            {/* 🏢 MOSTRAR ORGANIZACIÓN */}
            <p className="text-xs text-muted-foreground">
              <span className="font-medium">Organización:</span> {tooltipData.organization}
            </p>
            <p className="text-xs text-muted-foreground">
              <span className="font-medium">Período:</span> {tooltipData.start?.toLocaleDateString()} - {tooltipData.end?.toLocaleDateString()}
            </p>
            {/* 🎨 Indicador de fase con color */}
            <div className="flex items-center space-x-2">
              <div 
                className="w-2 h-2 rounded-full" 
                style={{ backgroundColor: phaseColors[tooltipData.phase as keyof typeof phaseColors] || "#ccc" }}
              ></div>
              <span className="text-xs font-medium">{tooltipData.phase}</span>
            </div>
          </div>
        </div>
      )}

      {/* 🔧 MODAL DE DETALLE DE TAREA */}
      <TaskDetailModal
        isOpen={isTaskModalOpen}
        onClose={closeTaskModal}
        onEdit={() => {
          // TODO: Implementar edición de tarea
          toast.info('Edición de tarea en desarrollo');
        }}
        onDelete={() => {
          // TODO: Implementar eliminación de tarea
          toast.info('Eliminación de tarea en desarrollo');
          closeTaskModal();
          refreshData();
        }}
      />

      {/* ➕ WIZARD DE CREACIÓN DE TAREA */}
      {isAddTaskOpen && (
        <TaskStepWizard
          onComplete={handleTaskComplete}
          onCancel={handleTaskCancel}
        />
      )}
    </div>
    </>
  );
};

export default GanttChart;
