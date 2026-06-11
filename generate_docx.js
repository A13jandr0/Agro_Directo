const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  HeadingLevel, AlignmentType, BorderStyle, WidthType, ShadingType,
  PageNumber, PageBreak, LevelFormat
} = require('docx');
const fs = require('fs');
const path = require('path');

const GREEN = "1B6B3A";
const LIGHT_GREEN = "E8F5E9";
const DARK_GREEN = "145A2E";
const GRAY = "F5F5F5";
const ORANGE = "E65100";
const BLUE = "1565C0";

const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: border, bottom: border, left: border, right: border };

function heading1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 400, after: 200 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: GREEN, space: 6 } },
    children: [new TextRun({ text, bold: true, size: 32, color: DARK_GREEN, font: "Arial" })]
  });
}

function heading2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 300, after: 150 },
    children: [new TextRun({ text, bold: true, size: 26, color: GREEN, font: "Arial" })]
  });
}

function heading3(text) {
  return new Paragraph({
    spacing: { before: 200, after: 100 },
    children: [new TextRun({ text, bold: true, size: 22, color: "333333", font: "Arial" })]
  });
}

function para(text, options = {}) {
  return new Paragraph({
    spacing: { before: 80, after: 80 },
    children: [new TextRun({ text, size: 22, font: "Arial", ...options })]
  });
}

function bullet(text, bold = false) {
  return new Paragraph({
    numbering: { reference: "bullets", level: 0 },
    spacing: { before: 60, after: 60 },
    children: [new TextRun({ text, size: 22, font: "Arial", bold })]
  });
}

function spacer(lines = 1) {
  return new Paragraph({ spacing: { before: 80 * lines, after: 0 }, children: [new TextRun("")] });
}

function infoBox(label, value) {
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [2400, 6960],
    rows: [new TableRow({
      children: [
        new TableCell({
          borders,
          width: { size: 2400, type: WidthType.DXA },
          shading: { fill: LIGHT_GREEN, type: ShadingType.CLEAR },
          margins: { top: 80, bottom: 80, left: 120, right: 120 },
          children: [new Paragraph({ children: [new TextRun({ text: label, bold: true, size: 20, color: DARK_GREEN, font: "Arial" })] })]
        }),
        new TableCell({
          borders,
          width: { size: 6960, type: WidthType.DXA },
          margins: { top: 80, bottom: 80, left: 120, right: 120 },
          children: [new Paragraph({ children: [new TextRun({ text: value, size: 20, font: "Arial" })] })]
        })
      ]
    })]
  });
}

function statusTable(rows) {
  const headerRow = new TableRow({
    children: [
      new TableCell({
        borders, width: { size: 1800, type: WidthType.DXA },
        shading: { fill: GREEN, type: ShadingType.CLEAR },
        margins: { top: 80, bottom: 80, left: 120, right: 120 },
        children: [new Paragraph({ children: [new TextRun({ text: "Issue", bold: true, size: 20, color: "FFFFFF", font: "Arial" })] })]
      }),
      new TableCell({
        borders, width: { size: 4560, type: WidthType.DXA },
        shading: { fill: GREEN, type: ShadingType.CLEAR },
        margins: { top: 80, bottom: 80, left: 120, right: 120 },
        children: [new Paragraph({ children: [new TextRun({ text: "Historia de Usuario", bold: true, size: 20, color: "FFFFFF", font: "Arial" })] })]
      }),
      new TableCell({
        borders, width: { size: 1500, type: WidthType.DXA },
        shading: { fill: GREEN, type: ShadingType.CLEAR },
        margins: { top: 80, bottom: 80, left: 120, right: 120 },
        children: [new Paragraph({ children: [new TextRun({ text: "Sprint", bold: true, size: 20, color: "FFFFFF", font: "Arial" })] })]
      }),
      new TableCell({
        borders, width: { size: 1500, type: WidthType.DXA },
        shading: { fill: GREEN, type: ShadingType.CLEAR },
        margins: { top: 80, bottom: 80, left: 120, right: 120 },
        children: [new Paragraph({ children: [new TextRun({ text: "Estado", bold: true, size: 20, color: "FFFFFF", font: "Arial" })] })]
      }),
    ]
  });

  const dataRows = rows.map((r, i) => new TableRow({
    children: [
      new TableCell({
        borders, width: { size: 1800, type: WidthType.DXA },
        shading: { fill: i % 2 === 0 ? "FFFFFF" : GRAY, type: ShadingType.CLEAR },
        margins: { top: 80, bottom: 80, left: 120, right: 120 },
        children: [new Paragraph({ children: [new TextRun({ text: r[0], size: 18, font: "Arial", bold: true, color: BLUE })] })]
      }),
      new TableCell({
        borders, width: { size: 4560, type: WidthType.DXA },
        shading: { fill: i % 2 === 0 ? "FFFFFF" : GRAY, type: ShadingType.CLEAR },
        margins: { top: 80, bottom: 80, left: 120, right: 120 },
        children: [new Paragraph({ children: [new TextRun({ text: r[1], size: 18, font: "Arial" })] })]
      }),
      new TableCell({
        borders, width: { size: 1500, type: WidthType.DXA },
        shading: { fill: i % 2 === 0 ? "FFFFFF" : GRAY, type: ShadingType.CLEAR },
        margins: { top: 80, bottom: 80, left: 120, right: 120 },
        children: [new Paragraph({ children: [new TextRun({ text: r[2], size: 18, font: "Arial" })] })]
      }),
      new TableCell({
        borders, width: { size: 1500, type: WidthType.DXA },
        shading: { fill: r[3] === "✅ Finalizada" ? "E8F5E9" : "FFF3E0", type: ShadingType.CLEAR },
        margins: { top: 80, bottom: 80, left: 120, right: 120 },
        children: [new Paragraph({ children: [new TextRun({ text: r[3], size: 18, font: "Arial", bold: true, color: r[3] === "✅ Finalizada" ? GREEN : ORANGE })] })]
      }),
    ]
  }));

  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [1800, 4560, 1500, 1500],
    rows: [headerRow, ...dataRows]
  });
}

const doc = new Document({
  numbering: {
    config: [
      {
        reference: "bullets",
        levels: [{
          level: 0, format: LevelFormat.BULLET, text: "-",
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } }
        }]
      }
    ]
  },
  styles: {
    default: { document: { run: { font: "Arial", size: 22 } } },
    paragraphStyles: [
      {
        id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 32, bold: true, font: "Arial", color: DARK_GREEN },
        paragraph: { spacing: { before: 400, after: 200 }, outlineLevel: 0 }
      },
      {
        id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 26, bold: true, font: "Arial", color: GREEN },
        paragraph: { spacing: { before: 300, after: 150 }, outlineLevel: 1 }
      }
    ]
  },
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
      }
    },
    children: [
      // ─── PORTADA ───
      spacer(4),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 200 },
        children: [new TextRun({ text: "UNIVERSIDAD DEL VALLE — UNIVALLE", size: 22, font: "Arial", color: "666666" })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 200 },
        children: [new TextRun({ text: "Ingeniería de Sistemas Informáticos", size: 22, font: "Arial", color: "666666" })]
      }),
      spacer(2),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 300 },
        children: [new TextRun({ text: "🌱 AgroDirecto Santa Cruz", size: 56, bold: true, font: "Arial", color: DARK_GREEN })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 200 },
        children: [new TextRun({ text: "Marketplace Agropecuario Digital", size: 32, font: "Arial", color: GREEN })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 600 },
        children: [new TextRun({ text: "Documentación Final del Proyecto", size: 26, font: "Arial", color: "555555" })]
      }),
      spacer(2),
      new Table({
        width: { size: 6000, type: WidthType.DXA },
        columnWidths: [3000, 3000],
        rows: [
          new TableRow({ children: [
            new TableCell({ borders, width: { size: 3000, type: WidthType.DXA }, shading: { fill: LIGHT_GREEN, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Estudiantes", bold: true, size: 20, font: "Arial", color: DARK_GREEN })] })] }),
            new TableCell({ borders, width: { size: 3000, type: WidthType.DXA }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [
              new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Sara Camila Álvarez", size: 18, font: "Arial" })] }),
              new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Jean Sebastián Acho", size: 18, font: "Arial" })] }),
              new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Carmen Pumari", size: 18, font: "Arial" })] })
            ] }),
          ]}),
          new TableRow({ children: [
            new TableCell({ borders, width: { size: 3000, type: WidthType.DXA }, shading: { fill: LIGHT_GREEN, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Instructor", bold: true, size: 20, font: "Arial", color: DARK_GREEN })] })] }),
            new TableCell({ borders, width: { size: 3000, type: WidthType.DXA }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Ing. Mario Covarrubias", size: 20, font: "Arial" })] })] }),
          ]}),
          new TableRow({ children: [
            new TableCell({ borders, width: { size: 3000, type: WidthType.DXA }, shading: { fill: LIGHT_GREEN, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Fecha", bold: true, size: 20, font: "Arial", color: DARK_GREEN })] })] }),
            new TableCell({ borders, width: { size: 3000, type: WidthType.DXA }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "8 de junio de 2026", size: 20, font: "Arial" })] })] }),
          ]}),
          new TableRow({ children: [
            new TableCell({ borders, width: { size: 3000, type: WidthType.DXA }, shading: { fill: LIGHT_GREEN, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Metodología", bold: true, size: 20, font: "Arial", color: DARK_GREEN })] })] }),
            new TableCell({ borders, width: { size: 3000, type: WidthType.DXA }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Híbrida PMI + Scrum", size: 20, font: "Arial" })] })] }),
          ]}),
        ]
      }),
      new Paragraph({ children: [new PageBreak()] }),

      // ─── 1. RESUMEN EJECUTIVO ───
      heading1("1. Resumen Ejecutivo"),
      para("AgroDirecto Santa Cruz es un marketplace agropecuario digital desarrollado para eliminar la intermediación excesiva entre productores rurales del departamento de Santa Cruz y compradores urbanos. El sistema integra tres módulos principales: gestión de oferta productiva, marketplace inteligente con geolocalización y bolsa de carga colaborativa para transportistas."),
      spacer(),
      para("El proyecto fue desarrollado en un período de 10 semanas (30 de marzo al 8 de junio de 2026) bajo una metodología híbrida que combina la planificación predictiva de PMI con la ejecución ágil de Scrum en 3 sprints de dos semanas cada uno."),
      spacer(),

      heading2("Stack Tecnológico"),
      infoBox("Frontend", "React 18 + Vite — Desplegado en Vercel"),
      spacer(0.5),
      infoBox("Backend", "Node.js + Express — Desplegado en Render"),
      spacer(0.5),
      infoBox("Base de Datos", "SQL Server con tipos GEOGRAPHY — Azure SQL Database"),
      spacer(0.5),
      infoBox("Gestión", "Jira (proyecto PAA) — Metodología Scrum"),
      spacer(0.5),
      infoBox("Repositorio", "GitHub — github.com/A13jandr0"),
      spacer(),

      heading2("Métricas del Proyecto"),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [2340, 2340, 2340, 2340],
        rows: [
          new TableRow({ children: [
            new TableCell({ borders, width: { size: 2340, type: WidthType.DXA }, shading: { fill: GREEN, type: ShadingType.CLEAR }, margins: { top: 100, bottom: 100, left: 120, right: 120 }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "32", bold: true, size: 48, font: "Arial", color: "FFFFFF" })] }), new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Historias completadas", size: 18, font: "Arial", color: "FFFFFF" })] })] }),
            new TableCell({ borders, width: { size: 2340, type: WidthType.DXA }, shading: { fill: DARK_GREEN, type: ShadingType.CLEAR }, margins: { top: 100, bottom: 100, left: 120, right: 120 }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "3", bold: true, size: 48, font: "Arial", color: "FFFFFF" })] }), new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Sprints completados", size: 18, font: "Arial", color: "FFFFFF" })] })] }),
            new TableCell({ borders, width: { size: 2340, type: WidthType.DXA }, shading: { fill: GREEN, type: ShadingType.CLEAR }, margins: { top: 100, bottom: 100, left: 120, right: 120 }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "22", bold: true, size: 48, font: "Arial", color: "FFFFFF" })] }), new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Pantallas implementadas", size: 18, font: "Arial", color: "FFFFFF" })] })] }),
            new TableCell({ borders, width: { size: 2340, type: WidthType.DXA }, shading: { fill: DARK_GREEN, type: ShadingType.CLEAR }, margins: { top: 100, bottom: 100, left: 120, right: 120 }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "4", bold: true, size: 48, font: "Arial", color: "FFFFFF" })] }), new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Roles de usuario", size: 18, font: "Arial", color: "FFFFFF" })] })] }),
          ]})
        ]
      }),
      new Paragraph({ children: [new PageBreak()] }),

      // ─── 2. DESCRIPCIÓN DEL SISTEMA ───
      heading1("2. Descripción del Sistema"),
      para("AgroDirecto Santa Cruz resuelve tres problemas críticos del ecosistema agropecuario boliviano:"),
      spacer(0.5),
      bullet("Intermediación excesiva: el producto pasa por 3 o 4 manos antes de llegar al mercado (Abasto, Mutualista o supermercados), reduciendo el margen del productor hasta en un 40%."),
      bullet("Logística informal: no existen canales digitales para contratar transporte de carga de pequeña escala en las rutas interprovinciales de Santa Cruz."),
      bullet("Brecha de información: el productor no conoce en tiempo real el precio de referencia de sus productos en los mercados de la ciudad."),
      spacer(),

      heading2("Módulos Principales"),
      heading3("Módulo del Productor"),
      bullet("Registro georeferenciado de parcelas con tipo de dato GEOGRAPHY en SQL Server"),
      bullet("Catálogo de cosechas con fotos, precios, stock y sistema de preventa (anticipo del 40%)"),
      bullet("Comparativa de precios vs. Mercado de Abasto en tiempo real"),
      bullet("Dashboard financiero con métricas de ventas e ingresos"),
      spacer(0.5),
      heading3("Módulo del Comprador"),
      bullet("Marketplace inteligente con búsqueda por proximidad geográfica (filtro por km)"),
      bullet("Carrito de compras con QR de pago simulado"),
      bullet("Timeline de seguimiento de pedidos: Pendiente → Confirmado → En Camino → Entregado"),
      bullet("Sistema de preventa con pago de anticipo y liquidación de saldo"),
      spacer(0.5),
      heading3("Módulo del Transportista"),
      bullet("Bolsa de cargas colaborativa con pedidos disponibles para flete"),
      bullet("Hoja de ruta interactiva con navegación a Google Maps"),
      bullet("Confirmación digital de entrega mediante firma en canvas HTML5"),
      spacer(0.5),
      heading3("Módulo de Administración"),
      bullet("Panel de verificación de documentos de productores y transportistas"),
      bullet("Flujo de aprobación/rechazo con motivo guardado en base de datos"),
      bullet("Control de acceso por estado: PENDIENTE_VERIFICACION → VERIFICADO → RECHAZADO"),
      new Paragraph({ children: [new PageBreak()] }),

      // ─── 3. ARQUITECTURA ───
      heading1("3. Arquitectura del Sistema"),
      heading2("Diagrama de Capas"),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [9360],
        rows: [
          new TableRow({ children: [new TableCell({ borders, width: { size: 9360, type: WidthType.DXA }, shading: { fill: LIGHT_GREEN, type: ShadingType.CLEAR }, margins: { top: 120, bottom: 120, left: 200, right: 200 }, children: [
            new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "CAPA DE PRESENTACIÓN", bold: true, size: 22, font: "Arial", color: DARK_GREEN })] }),
            new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "React 18 + Vite + TailwindCSS + Recharts + Leaflet", size: 20, font: "Arial" })] }),
            new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Desplegado en Vercel", size: 18, font: "Arial", color: "666666" })] }),
          ] })] }),
          new TableRow({ children: [new TableCell({ borders, width: { size: 9360, type: WidthType.DXA }, shading: { fill: "FFFFFF", type: ShadingType.CLEAR }, margins: { top: 120, bottom: 120, left: 200, right: 200 }, children: [
            new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "▼  JWT + HTTPS  ▼", size: 18, font: "Arial", color: "999999" })] }),
          ] })] }),
          new TableRow({ children: [new TableCell({ borders, width: { size: 9360, type: WidthType.DXA }, shading: { fill: LIGHT_GREEN, type: ShadingType.CLEAR }, margins: { top: 120, bottom: 120, left: 200, right: 200 }, children: [
            new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "CAPA DE NEGOCIO (API REST)", bold: true, size: 22, font: "Arial", color: DARK_GREEN })] }),
            new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Node.js + Express + Middleware JWT + CORS", size: 20, font: "Arial" })] }),
            new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Desplegado en Render", size: 18, font: "Arial", color: "666666" })] }),
          ] })] }),
          new TableRow({ children: [new TableCell({ borders, width: { size: 9360, type: WidthType.DXA }, shading: { fill: "FFFFFF", type: ShadingType.CLEAR }, margins: { top: 120, bottom: 120, left: 200, right: 200 }, children: [
            new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "▼  mssql driver  ▼", size: 18, font: "Arial", color: "999999" })] }),
          ] })] }),
          new TableRow({ children: [new TableCell({ borders, width: { size: 9360, type: WidthType.DXA }, shading: { fill: LIGHT_GREEN, type: ShadingType.CLEAR }, margins: { top: 120, bottom: 120, left: 200, right: 200 }, children: [
            new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "CAPA DE DATOS", bold: true, size: 22, font: "Arial", color: DARK_GREEN })] }),
            new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "SQL Server + Tipo GEOGRAPHY + Índices Espaciales", size: 20, font: "Arial" })] }),
            new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Azure SQL Database — AgroDirecto_Santa_Cruz_1", size: 18, font: "Arial", color: "666666" })] }),
          ] })] }),
        ]
      }),
      spacer(),
      heading2("Modelo de Datos Principal"),
      para("La base de datos cuenta con 9 tablas principales diseñadas bajo los principios de normalización:"),
      spacer(0.5),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [2500, 4360, 2500],
        rows: [
          new TableRow({ children: [
            new TableCell({ borders, width: { size: 2500, type: WidthType.DXA }, shading: { fill: GREEN, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: "Tabla", bold: true, size: 20, font: "Arial", color: "FFFFFF" })] })] }),
            new TableCell({ borders, width: { size: 4360, type: WidthType.DXA }, shading: { fill: GREEN, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: "Descripción", bold: true, size: 20, font: "Arial", color: "FFFFFF" })] })] }),
            new TableCell({ borders, width: { size: 2500, type: WidthType.DXA }, shading: { fill: GREEN, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: "Tipo Clave", bold: true, size: 20, font: "Arial", color: "FFFFFF" })] })] }),
          ]}),
          ...[ 
            ["usuarios", "Identidad central de todos los roles con trigger de estado automático", "UNIQUEIDENTIFIER"],
            ["perfil_productor", "Extensión del productor con coordenadas GEOGRAPHY", "FK → usuarios"],
            ["perfil_comprador", "Datos del comprador y ciudad de entrega", "FK → usuarios"],
            ["perfil_transportista", "Vehículo, licencia y zona de operación", "FK → usuarios"],
            ["Cosechas", "Catálogo de productos con columna calculada es_preventa", "FK → perfil_productor"],
            ["Pedidos", "Ciclo de compra completo con estados y montos", "FK → usuarios"],
            ["Detalle_Pedidos", "Líneas de pedido con snapshot de precio", "FK → Pedidos + Cosechas"],
            ["Precios_Mercado_Abasto", "Precios de referencia del mercado cruceño", "INT IDENTITY"],
            ["notificaciones_app", "Alertas de estacionalidad por categoría", "FK → usuarios"],
          ].map((r, i) => new TableRow({ children: [
            new TableCell({ borders, width: { size: 2500, type: WidthType.DXA }, shading: { fill: i % 2 === 0 ? "FFFFFF" : GRAY, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: r[0], size: 18, font: "Arial", bold: true, color: BLUE })] })] }),
            new TableCell({ borders, width: { size: 4360, type: WidthType.DXA }, shading: { fill: i % 2 === 0 ? "FFFFFF" : GRAY, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: r[1], size: 18, font: "Arial" })] })] }),
            new TableCell({ borders, width: { size: 2500, type: WidthType.DXA }, shading: { fill: i % 2 === 0 ? "FFFFFF" : GRAY, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: r[2], size: 18, font: "Arial" })] })] }),
          ]}))
        ]
      }),
      new Paragraph({ children: [new PageBreak()] }),

      // ─── 4. SPRINTS ───
      heading1("4. Ejecución por Sprints"),

      heading2("Sprint 1 — Gobernanza y Estructura de Datos (6 - 26 de Abril)"),
      para("Objetivo: Crear el esqueleto del marketplace y la gestión de identidad geográfica."),
      spacer(0.5),
      statusTable([
        ["PAA-1", "US01 – Registro Multitipo por Rol", "Sprint 1", "✅ Finalizada"],
        ["PAA-2", "US02 – Geolocalización de Finca", "Sprint 1", "✅ Finalizada"],
        ["PAA-3", "US04 – Verificación de Documentos del Usuario", "Sprint 1", "✅ Finalizada"],
        ["PAA-5", "Iniciar sesión con email/contraseña y token JWT 24h", "Sprint 1", "✅ Finalizada"],
        ["PAA-10", "Asignar estado inicial según rol automáticamente", "Sprint 1", "✅ Finalizada"],
        ["PAA-11", "Almacenar coordenadas GPS en formato GEOGRAPHY", "Sprint 1", "✅ Finalizada"],
        ["PAA-12", "Marcar ubicación exacta de finca en mapa interactivo", "Sprint 1", "✅ Finalizada"],
        ["PAA-13", "Seleccionar rol al registrarse", "Sprint 1", "✅ Finalizada"],
        ["PAA-14", "Indicar tipo de negocio y ciudad como Comprador", "Sprint 1", "✅ Finalizada"],
        ["PAA-15", "Completar wizard 3 pasos como Productor", "Sprint 1", "✅ Finalizada"],
        ["PAA-17", "Proteger rutas del panel admin con middleware ADMIN", "Sprint 1", "✅ Finalizada"],
        ["PAA-18", "Crear esquema SQL completo con tipos geoespaciales", "Sprint 1", "✅ Finalizada"],
      ]),
      spacer(),

      heading2("Sprint 2 — Catálogo e Inventario Dinámico (27 de Abril - 17 de Mayo)"),
      para("Objetivo: Publicar la oferta productiva de las provincias y permitir la búsqueda inteligente."),
      spacer(0.5),
      statusTable([
        ["PAA-37", "US05 – Publicación de Cosecha", "Sprint 2", "✅ Finalizada"],
        ["PAA-38", "US06 – Disponibilidad Futura (Preventa)", "Sprint 2", "✅ Finalizada"],
        ["PAA-39", "US07 – Buscador por Cercanía (CRÍTICA)", "Sprint 2", "✅ Finalizada"],
        ["PAA-40", "US08 – Alerta de Estacionalidad", "Sprint 2", "✅ Finalizada"],
        ["PAA-41", "US09 – Comparador de Precios (Insight de Mercado)", "Sprint 2", "✅ Finalizada"],
        ["PAA-42", "US21 – Edición y Gestión de Productos", "Sprint 2", "✅ Finalizada"],
        ["PAA-43", "US22 – Validación de Stock", "Sprint 2", "✅ Finalizada"],
        ["PAA-44", "US23 – Vista Detalle de Producto", "Sprint 2", "✅ Finalizada"],
        ["PAA-28", "Implementar interfaz mobile-first paleta verde esmeralda", "Sprint 2", "✅ Finalizada"],
        ["PAA-29", "Producir wireframes de alta fidelidad", "Sprint 2", "✅ Finalizada"],
      ]),
      spacer(),

      heading2("Sprint 3 — Transacciones, Logística y Cierre (18 de Mayo - 8 de Junio)"),
      para("Objetivo: Completar el ciclo de venta, integrar pagos y generar reportes para el Sponsor."),
      spacer(0.5),
      statusTable([
        ["PAA-30", "US18 – Confirmación Digital de Entrega", "Sprint 3", "✅ Finalizada"],
        ["PAA-31", "Carga de Documentos de Verificación", "Sprint 3", "✅ Finalizada"],
        ["PAA-35", "Restricción Funcional por estado de verificación", "Sprint 3", "✅ Finalizada"],
        ["PAA-45", "US24 – Módulo de Pedidos: Carrito, Checkout y QR de Pago", "Sprint 3", "✅ Finalizada"],
        ["PAA-46", "US25 – Bolsa de Cargas y Asignación de Ruta", "Sprint 3", "✅ Finalizada"],
        ["PAA-47", "US26 – Cierre PMI: Lecciones Aprendidas y Manual", "Sprint 3", "✅ Finalizada"],
        ["PAA-48", "US27 – Dashboard de KPIs para el Sponsor (BI)", "Sprint 3", "✅ Finalizada"],
      ]),
      new Paragraph({ children: [new PageBreak()] }),

      // ─── 5. LECCIONES APRENDIDAS ───
      heading1("5. Registro de Lecciones Aprendidas (PMI)"),
      heading2("5.1 ¿Qué salió bien?"),
      bullet("Control de Cronograma Integrado: La combinación de metodologías híbridas funcionó de manera óptima.", true),
      bullet("Mitigación Activa de Riesgos de Seguridad: El flujo de verificación de documentos aportó la seguridad necesaria.", true),
      bullet("Uso del Tipo de Dato Geography en SQL Server: Facilitó consultas geoespaciales rápidas directamente en base de datos.", true),
      bullet("Modularización del Frontend en React 18: Separación limpia de componentes reutilizables.", true),
      spacer(),

      heading2("5.2 ¿Qué salió mal?"),
      bullet("Estimaciones de Desarrollo de Mapas: Se subestimó el esfuerzo de integración cartográfica.", true),
      bullet("Dependencia Temprana de Integración: Retrasos por no tener un contrato de API inmutable desde el primer día.", true),
      bullet("Almacenamiento Local de Documentos: Inicialmente se guardaron en disco, dificultando el despliegue serverless.", true),
      spacer(),

      heading2("5.3 ¿Qué haríamos diferente?"),
      bullet("Definición Temprana de Contratos API utilizando Swagger o similares.", true),
      bullet("Adopción de Pipelines de Integración Continua (CI/CD) automáticos.", true),
      bullet("Diseño Offline-First para la aplicación móvil del transportista.", true),
      new Paragraph({ children: [new PageBreak()] }),

      // ─── 6. MANUAL DE USUARIO ───
      heading1("6. Manual de Usuario Simplificado"),
      
      heading2("Módulo del Productor"),
      para("El productor puede registrarse completando sus datos y marcando la ubicación GPS de su finca. Una vez verificado por el administrador, puede publicar cosechas activas indicando categoría, precio, stock disponible y fecha de entrega."),
      spacer(0.5),

      heading2("Módulo del Comprador"),
      para("Permite al comprador buscar productos en un rango determinado de kilómetros, agregarlos al carrito de compras, confirmar el pedido adjuntando una transferencia por código QR y realizar el seguimiento en vivo."),
      spacer(0.5),

      heading2("Módulo del Transportista"),
      para("Permite a los transportistas aprobados tomar viajes de la Bolsa de Cargas, ver su origen/destino en Google Maps y confirmar la entrega físicamente solicitando una firma digital en pantalla."),
      spacer(0.5),

      heading2("Módulo de Administración"),
      para("Facilita la verificación de documentos cargados en el sistema y permite consultar las métricas y KPIs globales de AgroDirecto.")
    ]
  }]
});

Packer.toBuffer(doc).then((buffer) => {
  const filePath = path.join(__dirname, 'docs', 'AgroDirecto_Documentacion_Final.docx');
  fs.writeFileSync(filePath, buffer);
  console.log(`✅ Documento generado exitosamente en: ${filePath}`);
});
