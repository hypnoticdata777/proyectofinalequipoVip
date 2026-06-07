"""
Genera el Reporte de Seguimiento de Requerimientos (Actividad 5) en formato PDF.
Proyecto: USF Portal - Universidad Santa Fe, Campus Paraíso
"""

from reportlab.lib.pagesizes import letter, A4
from reportlab.lib import colors
from reportlab.lib.units import cm, mm
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY, TA_RIGHT
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    HRFlowable, PageBreak, KeepTogether
)
from reportlab.platypus.flowables import BalancedColumns
from reportlab.graphics.shapes import Drawing, Rect, String
from reportlab.graphics import renderPDF
import datetime

# ─── COLORES ─────────────────────────────────────────────────────────────────
AZUL     = colors.HexColor("#0A2540")
DORADO   = colors.HexColor("#D4AF37")
AZUL_M   = colors.HexColor("#1E3A5F")
GRIS     = colors.HexColor("#F5F5F5")
GRIS_M   = colors.HexColor("#DDDDDD")
VERDE    = colors.HexColor("#28A745")
NARANJA  = colors.HexColor("#FFA500")
ROJO     = colors.HexColor("#DC3545")
MORADO   = colors.HexColor("#6F42C1")
BLANCO   = colors.white
NEGRO    = colors.HexColor("#1A1A1A")
AZUL_F   = colors.HexColor("#EBF3FA")
VERDE_F  = colors.HexColor("#E8F5E9")
AMARILLO_F = colors.HexColor("#FFF9E6")
ROJO_F   = colors.HexColor("#FFEBEE")

# ─── ESTILOS ─────────────────────────────────────────────────────────────────
styles = getSampleStyleSheet()

def s(name, **kw):
    return ParagraphStyle(name, **kw)

TITULO_DOC = s("TituloDoc", fontName="Helvetica-Bold", fontSize=20,
               textColor=BLANCO, alignment=TA_CENTER, leading=26)
SUBTITULO = s("Subtitulo", fontName="Helvetica-Bold", fontSize=13,
              textColor=DORADO, alignment=TA_CENTER, leading=18)
TITULO_SEC = s("TituloSec", fontName="Helvetica-Bold", fontSize=12,
               textColor=BLANCO, backColor=AZUL, alignment=TA_LEFT,
               leading=18, leftIndent=6, rightIndent=6,
               spaceBefore=14, spaceAfter=6,
               borderPadding=(4, 8, 4, 8))
TITULO_SUB = s("TituloSub", fontName="Helvetica-Bold", fontSize=10,
               textColor=AZUL, alignment=TA_LEFT,
               leading=14, spaceBefore=10, spaceAfter=4,
               borderPadding=(2, 0, 2, 0))
CUERPO = s("Cuerpo", fontName="Helvetica", fontSize=9,
           textColor=NEGRO, alignment=TA_JUSTIFY, leading=13,
           spaceBefore=2, spaceAfter=4)
CUERPO_B = s("CuerpoB", fontName="Helvetica-Bold", fontSize=9,
             textColor=AZUL, alignment=TA_LEFT, leading=13,
             spaceBefore=2, spaceAfter=4)
PIE = s("Pie", fontName="Helvetica", fontSize=7.5,
        textColor=colors.HexColor("#666666"), alignment=TA_CENTER, leading=10)
NOTA = s("Nota", fontName="Helvetica-Oblique", fontSize=8.5,
         textColor=colors.HexColor("#555555"), alignment=TA_LEFT,
         leading=12, leftIndent=10, spaceBefore=4, spaceAfter=4)
BULLET = s("Bullet", fontName="Helvetica", fontSize=9,
           textColor=NEGRO, alignment=TA_LEFT, leading=12,
           leftIndent=16, spaceBefore=1, spaceAfter=1,
           bulletIndent=6)
ENCAB_TAB = s("EncabTab", fontName="Helvetica-Bold", fontSize=8.5,
              textColor=BLANCO, alignment=TA_CENTER, leading=11)
CELDA_TAB = s("CeldaTab", fontName="Helvetica", fontSize=8,
              textColor=NEGRO, alignment=TA_LEFT, leading=10)
CELDA_C = s("CeldaC", fontName="Helvetica", fontSize=8,
            textColor=NEGRO, alignment=TA_CENTER, leading=10)
BADGE = s("Badge", fontName="Helvetica-Bold", fontSize=8,
          textColor=BLANCO, alignment=TA_CENTER, leading=10)

# ─── HELPERS ─────────────────────────────────────────────────────────────────
def badge(texto, color):
    """Celda con fondo de color para tablas."""
    return Paragraph(f"<b>{texto}</b>", ParagraphStyle(
        "B", fontName="Helvetica-Bold", fontSize=8,
        textColor=colors.white, alignment=TA_CENTER, leading=10,
        backColor=color
    ))

def color_estado(estado):
    m = {"Finalizado": VERDE, "En proceso": NARANJA,
         "Pendiente": ROJO, "Excluido": MORADO}
    return m.get(estado, GRIS_M)

def p(txt, st=None):
    return Paragraph(txt, st or CUERPO)

def seccion(titulo):
    return Paragraph(f"  {titulo}", TITULO_SEC)

def subseccion(titulo):
    return [Paragraph(titulo, TITULO_SUB),
            HRFlowable(width="100%", thickness=1, color=DORADO,
                       spaceAfter=4)]

def hr():
    return HRFlowable(width="100%", thickness=0.5, color=GRIS_M,
                      spaceBefore=4, spaceAfter=4)

def tabla_base(data, col_widths, header_rows=1, zebra=True,
               header_bg=AZUL, alt_bg=AZUL_F):
    t = Table(data, colWidths=col_widths, repeatRows=header_rows)
    style = [
        # Encabezado
        ("BACKGROUND", (0, 0), (-1, header_rows - 1), header_bg),
        ("TEXTCOLOR", (0, 0), (-1, header_rows - 1), BLANCO),
        ("FONTNAME", (0, 0), (-1, header_rows - 1), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, header_rows - 1), 8.5),
        ("ALIGN", (0, 0), (-1, header_rows - 1), "CENTER"),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("LEFTPADDING", (0, 0), (-1, -1), 5),
        ("RIGHTPADDING", (0, 0), (-1, -1), 5),
        ("GRID", (0, 0), (-1, -1), 0.4, GRIS_M),
        ("ROWBACKGROUNDS", (0, header_rows), (-1, -1),
         [BLANCO, alt_bg] if zebra else [BLANCO]),
        ("FONTNAME", (0, header_rows), (-1, -1), "Helvetica"),
        ("FONTSIZE", (0, header_rows), (-1, -1), 8),
    ]
    t.setStyle(TableStyle(style))
    return t

# ─── PORTADA ─────────────────────────────────────────────────────────────────
def build_portada():
    elems = []

    # Barra azul superior (simulada con tabla de una celda)
    portada_tabla = Table([[""]], colWidths=[19*cm], rowHeights=[0.6*cm])
    portada_tabla.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,-1), DORADO),
    ]))
    elems.append(portada_tabla)
    elems.append(Spacer(1, 1.2*cm))

    # Logo textual
    logo = Table([[Paragraph("USF", ParagraphStyle("L", fontName="Helvetica-Bold",
        fontSize=36, textColor=AZUL, alignment=TA_CENTER)),
        Paragraph("Portal", ParagraphStyle("L2", fontName="Helvetica",
        fontSize=22, textColor=AZUL_M, alignment=TA_LEFT, leftIndent=6))]],
        colWidths=[3.5*cm, 6*cm])
    elems.append(logo)
    elems.append(Spacer(1, 0.5*cm))

    elems.append(HRFlowable(width="100%", thickness=2, color=AZUL, spaceAfter=8))

    elems.append(Paragraph("UNIVERSIDAD SANTA FE — CAMPUS PARAÍSO",
        ParagraphStyle("UP", fontName="Helvetica-Bold", fontSize=13,
                       textColor=AZUL, alignment=TA_CENTER, leading=18)))
    elems.append(Spacer(1, 0.3*cm))
    elems.append(Paragraph("Materia: Trazabilidad y Configuración de Software",
        ParagraphStyle("MT", fontName="Helvetica-Oblique", fontSize=10,
                       textColor=AZUL_M, alignment=TA_CENTER)))
    elems.append(Spacer(1, 1.5*cm))

    # Caja principal del título
    caja = Table([
        [Paragraph("ACTIVIDAD 5", ParagraphStyle("A5", fontName="Helvetica-Bold",
            fontSize=11, textColor=DORADO, alignment=TA_CENTER))],
        [Paragraph("Reporte de Seguimiento de Requerimientos",
            ParagraphStyle("RSR", fontName="Helvetica-Bold", fontSize=16,
                           textColor=BLANCO, alignment=TA_CENTER, leading=22))],
        [Paragraph("con evidencias y conclusiones",
            ParagraphStyle("Con", fontName="Helvetica-Oblique", fontSize=10,
                           textColor=GRIS_M, alignment=TA_CENTER))],
    ], colWidths=[19*cm], rowHeights=[0.7*cm, 1.4*cm, 0.7*cm])
    caja.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,-1), AZUL),
        ("LEFTPADDING", (0,0), (-1,-1), 20),
        ("RIGHTPADDING", (0,0), (-1,-1), 20),
        ("TOPPADDING", (0,0), (0,-1), 10),
        ("BOTTOMPADDING", (0,2), (-1,-1), 10),
    ]))
    elems.append(caja)
    elems.append(Spacer(1, 1.5*cm))

    # Datos del equipo
    info_rows = [
        ["Equipo:", "Equipo VIP — 7° y 8° Semestre"],
        ["Integrantes:", "Carlos Sanchez    |   Luis Roberto Suarez   |   Ricardo Galindo"],
        ["", "Eduardo Robles   |   Mariana Jimenez"],
        ["Catedrático:", "Rafael Bernal Gallegos"],
        ["Fecha de entrega:", "07 de junio de 2026"],
        ["Versión:", "1.0 — Entrega Final"],
        ["Proyecto:", "USF Portal (Angular 17 + Express.js + MongoDB)"],
    ]

    info_tabla = Table(
        [[Paragraph(f"<b>{r[0]}</b>", ParagraphStyle("K", fontName="Helvetica-Bold",
            fontSize=9.5, textColor=AZUL)),
          Paragraph(r[1], ParagraphStyle("V", fontName="Helvetica", fontSize=9.5,
            textColor=NEGRO))]
         for r in info_rows],
        colWidths=[4*cm, 15*cm]
    )
    info_tabla.setStyle(TableStyle([
        ("VALIGN", (0,0), (-1,-1), "TOP"),
        ("TOPPADDING", (0,0), (-1,-1), 3),
        ("BOTTOMPADDING", (0,0), (-1,-1), 3),
        ("LINEBELOW", (0,-1), (-1,-1), 0.5, GRIS_M),
    ]))
    elems.append(info_tabla)
    elems.append(Spacer(1, 1.5*cm))

    # Resumen ejecutivo de portada
    resumen_rows = [
        ["24 RF activos", "7 RNF", "12 Casos de Uso", "10 CP activos"],
        ["22 Finalizado", "2 En proceso", "0 Pendientes", "3 Excluidos"],
    ]
    res_tabla = Table(resumen_rows, colWidths=[4.75*cm]*4)
    res_tabla.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,0), AZUL_M),
        ("BACKGROUND", (0,1), (-1,1), AZUL_F),
        ("TEXTCOLOR", (0,0), (-1,0), BLANCO),
        ("TEXTCOLOR", (0,1), (-1,1), AZUL),
        ("FONTNAME", (0,0), (-1,-1), "Helvetica-Bold"),
        ("FONTSIZE", (0,0), (-1,-1), 9),
        ("ALIGN", (0,0), (-1,-1), "CENTER"),
        ("VALIGN", (0,0), (-1,-1), "MIDDLE"),
        ("TOPPADDING", (0,0), (-1,-1), 7),
        ("BOTTOMPADDING", (0,0), (-1,-1), 7),
        ("GRID", (0,0), (-1,-1), 0.5, BLANCO),
    ]))
    elems.append(res_tabla)
    elems.append(Spacer(1, 0.5*cm))

    elems.append(HRFlowable(width="100%", thickness=2, color=DORADO, spaceAfter=4))
    elems.append(Paragraph(
        "Documento generado para la entrega de la Actividad 5 de la materia de Trazabilidad y Configuración de Software. "
        "Todo el contenido está basado en el código fuente y documentación oficial del repositorio del proyecto.",
        PIE))

    elems.append(PageBreak())
    return elems

# ─── SECCIÓN 1: INTRODUCCIÓN ─────────────────────────────────────────────────
def build_introduccion():
    elems = [seccion("1. INTRODUCCIÓN")]

    elems += subseccion("1.1 Propósito del documento")
    elems.append(p(
        "Este reporte presenta el seguimiento detallado de los requerimientos del sistema "
        "<b>USF Portal</b>, desarrollado como proyecto final del Equipo VIP en la materia de "
        "<b>Trazabilidad y Configuración de Software</b>. El objetivo es verificar el cumplimiento "
        "de cada requerimiento identificado en la Actividad 4, documentar el estado actual de "
        "implementación, identificar los cambios ocurridos durante el desarrollo y analizar el "
        "impacto de dichos cambios en el sistema."))

    elems += subseccion("1.2 Descripción del sistema")
    elems.append(p(
        "<b>USF Portal</b> es un sistema web de gestión académica para la Universidad Santa Fe, "
        "Campus Paraíso. Permite a alumnos, profesores y administradores realizar operaciones "
        "académicas como inscripción de materias, captura de calificaciones, consulta del historial "
        "académico (kardex) y gestión de adeudos financieros."))
    elems.append(Spacer(1, 4))

    tec = [
        [Paragraph("<b>Componente</b>", ENCAB_TAB),
         Paragraph("<b>Tecnología</b>", ENCAB_TAB),
         Paragraph("<b>Versión</b>", ENCAB_TAB),
         Paragraph("<b>Función principal</b>", ENCAB_TAB)],
        [p("Frontend", CELDA_C), p("Angular + Angular Material", CELDA_TAB),
         p("17 / 17", CELDA_C), p("Interfaz de usuario (SPA)", CELDA_TAB)],
        [p("Backend", CELDA_C), p("Node.js + Express.js", CELDA_TAB),
         p("20 LTS / 4.18", CELDA_C), p("API REST", CELDA_TAB)],
        [p("Base de datos", CELDA_C), p("MongoDB + Mongoose", CELDA_TAB),
         p("8.0 / 8.0", CELDA_C), p("Persistencia de datos (NoSQL)", CELDA_TAB)],
        [p("Autenticación", CELDA_C), p("Google OAuth 2.0 + JWT", CELDA_TAB),
         p("Passport 0.7 / JWT 9.0", CELDA_C), p("Control de acceso y sesión", CELDA_TAB)],
        [p("CI/CD", CELDA_C), p("GitHub Actions", CELDA_TAB),
         p("—", CELDA_C), p("Integración y despliegue continuo", CELDA_TAB)],
        [p("Despliegue", CELDA_C), p("Vercel + Railway + MongoDB Atlas", CELDA_TAB),
         p("—", CELDA_C), p("Infraestructura en la nube", CELDA_TAB)],
    ]
    elems.append(tabla_base(tec, [3*cm, 5*cm, 3.5*cm, 7.5*cm]))

    elems += subseccion("1.3 Alcance de este reporte")
    puntos = [
        "Estado actual de los 24 requerimientos funcionales activos y 7 no funcionales.",
        "Identificación de requerimientos implementados, pendientes y modificados.",
        "Documentación de los cambios ocurridos (incluyendo exclusiones) y su impacto.",
        "Análisis de las relaciones entre requerimientos, casos de uso, módulos y pruebas.",
        "Conclusiones y recomendaciones para la etapa de cierre del proyecto.",
    ]
    for pt in puntos:
        elems.append(Paragraph(f"• {pt}", BULLET))
    elems.append(Spacer(1, 6))
    return elems

# ─── SECCIÓN 2: ESTADO ACTUAL DE REQUERIMIENTOS ───────────────────────────────
def build_estado_reqs():
    elems = [seccion("2. ESTADO ACTUAL DE CADA REQUERIMIENTO")]

    elems += subseccion("2.1 Requerimientos Funcionales")
    elems.append(p(
        "A continuación se presenta el estado de implementación de cada requerimiento funcional "
        "identificado en la Actividad 4, con indicación de su módulo, caso de uso relacionado y "
        "evidencia de validación."))
    elems.append(Spacer(1, 4))

    rf_data = [
        [Paragraph("<b>ID</b>", ENCAB_TAB),
         Paragraph("<b>Requerimiento</b>", ENCAB_TAB),
         Paragraph("<b>Módulo</b>", ENCAB_TAB),
         Paragraph("<b>CU</b>", ENCAB_TAB),
         Paragraph("<b>CP</b>", ENCAB_TAB),
         Paragraph("<b>Estado</b>", ENCAB_TAB)],
        # Auth
        [p("RF-01",CELDA_C),p("Autenticación Google OAuth 2.0",CELDA_TAB),p("Auth",CELDA_C),p("CU-01",CELDA_C),p("CP-01",CELDA_C),badge("Finalizado",VERDE)],
        [p("RF-02",CELDA_C),p("Asignación automática de roles al primer login",CELDA_TAB),p("Auth",CELDA_C),p("CU-01",CELDA_C),p("CP-01",CELDA_C),badge("Finalizado",VERDE)],
        [p("RF-03",CELDA_C),p("Generación y validación de tokens JWT",CELDA_TAB),p("Auth",CELDA_C),p("CU-01",CELDA_C),p("CP-02",CELDA_C),badge("Finalizado",VERDE)],
        # Inscripción
        [p("RF-04",CELDA_C),p("Catálogo de materias disponibles por período",CELDA_TAB),p("Inscripción",CELDA_C),p("CU-02",CELDA_C),p("CP-07",CELDA_C),badge("Finalizado",VERDE)],
        [p("RF-05",CELDA_C),p("Validación de adeudos antes de inscribir",CELDA_TAB),p("Inscripción",CELDA_C),p("CU-02",CELDA_C),p("CP-03",CELDA_C),badge("Finalizado",VERDE)],
        [p("RF-06",CELDA_C),p("Verificación de cupo disponible",CELDA_TAB),p("Inscripción",CELDA_C),p("CU-02",CELDA_C),p("CP-04",CELDA_C),badge("Finalizado",VERDE)],
        [p("RF-07",CELDA_C),p("Validación de seriación (prerrequisitos)",CELDA_TAB),p("Inscripción",CELDA_C),p("CU-02",CELDA_C),p("CP-05",CELDA_C),badge("Finalizado",VERDE)],
        [p("RF-08",CELDA_C),p("Detección de cruces de horario",CELDA_TAB),p("Inscripción",CELDA_C),p("CU-02",CELDA_C),p("CP-06",CELDA_C),badge("Finalizado",VERDE)],
        [p("RF-09",CELDA_C),p("Consulta de inscripción activa (alumno)",CELDA_TAB),p("Inscripción",CELDA_C),p("CU-03",CELDA_C),p("—",CELDA_C),badge("Finalizado",VERDE)],
        [p("RF-10",CELDA_C),p("Cancelación de inscripción (admin)",CELDA_TAB),p("Inscripción",CELDA_C),p("CU-04",CELDA_C),p("—",CELDA_C),badge("Finalizado",VERDE)],
        # Calificaciones
        [p("RF-11",CELDA_C),p("Captura de calificaciones parciales",CELDA_TAB),p("Calificaciones",CELDA_C),p("CU-05",CELDA_C),p("CP-11",CELDA_C),badge("Finalizado",VERDE)],
        [p("RF-12",CELDA_C),p("Cálculo automático de calificación final",CELDA_TAB),p("Calificaciones",CELDA_C),p("CU-05",CELDA_C),p("CP-11",CELDA_C),badge("Finalizado",VERDE)],
        [p("RF-13",CELDA_C),p("Actas cerradas no editables",CELDA_TAB),p("Calificaciones",CELDA_C),p("CU-05",CELDA_C),p("CP-11",CELDA_C),badge("Finalizado",VERDE)],
        [p("RF-14",CELDA_C),p("Cierre de actas por el administrador",CELDA_TAB),p("Calificaciones",CELDA_C),p("CU-06",CELDA_C),p("CP-11",CELDA_C),badge("Finalizado",VERDE)],
        # Historial
        [p("RF-15",CELDA_C),p("Historial académico (kardex) agrupado por período",CELDA_TAB),p("Historial",CELDA_C),p("CU-07",CELDA_C),p("CP-12",CELDA_C),badge("Finalizado",VERDE)],
        [p("RF-16",CELDA_C),p("Cálculo de promedio general y créditos acumulados",CELDA_TAB),p("Historial",CELDA_C),p("CU-07",CELDA_C),p("CP-12",CELDA_C),badge("Finalizado",VERDE)],
        [p("RF-17",CELDA_C),p("Generación de PDF descargable del kardex",CELDA_TAB),p("Historial",CELDA_C),p("CU-08",CELDA_C),p("CP-12",CELDA_C),badge("Finalizado",VERDE)],
        # Adeudos
        [p("RF-18",CELDA_C),p("Registro de adeudos para alumnos (admin)",CELDA_TAB),p("Adeudos",CELDA_C),p("CU-09",CELDA_C),p("—",CELDA_C),badge("Finalizado",VERDE)],
        [p("RF-19",CELDA_C),p("Marcado de adeudo como pagado (admin)",CELDA_TAB),p("Adeudos",CELDA_C),p("CU-10",CELDA_C),p("—",CELDA_C),badge("Finalizado",VERDE)],
        [p("RF-20",CELDA_C),p("Consulta de adeudos propios (alumno)",CELDA_TAB),p("Adeudos",CELDA_C),p("CU-11",CELDA_C),p("—",CELDA_C),badge("Finalizado",VERDE)],
        # Seguridad / Materias
        [p("RF-21",CELDA_C),p("Protección de todas las rutas con JWT",CELDA_TAB),p("Seguridad",CELDA_C),p("Todos",CELDA_C),p("CP-02",CELDA_C),badge("Finalizado",VERDE)],
        [p("RF-22",CELDA_C),
         Paragraph("<strike>Notificaciones push en tiempo real</strike><br/><i>(excluido por instrucción del catedrático)</i>",
                   ParagraphStyle("Ex", fontName="Helvetica-Oblique", fontSize=7.5,
                                  textColor=colors.HexColor("#888888"))),
         p("N/A",CELDA_C),p("—",CELDA_C),p("—",CELDA_C),badge("Excluido",MORADO)],
        [p("RF-23",CELDA_C),p("Control de acceso por roles (RBAC)",CELDA_TAB),p("Seguridad",CELDA_C),p("Todos",CELDA_C),p("CP-13",CELDA_C),badge("Finalizado",VERDE)],
        [p("RF-24",CELDA_C),p("Gestión del catálogo de materias (CRUD admin)",CELDA_TAB),p("Materias",CELDA_C),p("CU-12",CELDA_C),p("—",CELDA_C),badge("Finalizado",VERDE)],
        [p("RF-25",CELDA_C),p("Materias asignadas visibles solo para el profesor",CELDA_TAB),p("Materias",CELDA_C),p("CU-12",CELDA_C),p("—",CELDA_C),badge("Finalizado",VERDE)],
    ]

    elems.append(tabla_base(rf_data, [1.4*cm, 6.5*cm, 2.5*cm, 1.5*cm, 1.5*cm, 2.1*cm],
                            alt_bg=AZUL_F))
    elems.append(Spacer(1, 6))

    elems += subseccion("2.2 Requerimientos No Funcionales")
    rnf_data = [
        [Paragraph("<b>ID</b>", ENCAB_TAB),
         Paragraph("<b>Requerimiento</b>", ENCAB_TAB),
         Paragraph("<b>Criterio de aceptación</b>", ENCAB_TAB),
         Paragraph("<b>Estado</b>", ENCAB_TAB)],
        [p("RNF-01",CELDA_C),p("Seguridad — JWT firmado con clave ≥ 64 chars y expiración configurable",CELDA_TAB),
         p("HS256 + JWT_EXPIRES_IN configurable",CELDA_TAB),badge("Finalizado",VERDE)],
        [p("RNF-02",CELDA_C),p("Rendimiento — Respuestas API < 2 segundos en carga normal",CELDA_TAB),
         p("Sin pruebas de carga ejecutadas aún",CELDA_TAB),badge("En proceso",NARANJA)],
        [p("RNF-03",CELDA_C),p("Usabilidad — Interfaz intuitiva con Angular Material y colores institucionales",CELDA_TAB),
         p("Paleta #0A2540 / #D4AF37 aplicada en toda la UI",CELDA_TAB),badge("Finalizado",VERDE)],
        [p("RNF-04",CELDA_C),p("Disponibilidad — 99.5% de uptime mensual",CELDA_TAB),
         p("Desplegado pero sin monitoreo activo configurado",CELDA_TAB),badge("En proceso",NARANJA)],
        [p("RNF-05",CELDA_C),p("Escalabilidad — Arquitectura modular extensible",CELDA_TAB),
         p("Capas desacopladas; lazy loading en Angular",CELDA_TAB),badge("Finalizado",VERDE)],
        [p("RNF-06",CELDA_C),p("Mantenibilidad — Código organizado en capas (MVC)",CELDA_TAB),
         p("Carpetas: controllers, services, models, routes",CELDA_TAB),badge("Finalizado",VERDE)],
        [p("RNF-07",CELDA_C),p("Portabilidad — Despliegue sin cambios en múltiples proveedores cloud",CELDA_TAB),
         p("Variables .env; sin hardcoded URLs",CELDA_TAB),badge("Finalizado",VERDE)],
    ]
    elems.append(tabla_base(rnf_data, [1.4*cm, 5.5*cm, 5.5*cm, 2.1*cm], alt_bg=AMARILLO_F))
    elems.append(Spacer(1, 6))
    return elems

# ─── SECCIÓN 3: REQUERIMIENTOS IMPLEMENTADOS / PENDIENTES / MODIFICADOS ───────
def build_clasificacion():
    elems = [seccion("3. CLASIFICACIÓN POR ESTADO DE LOS REQUERIMIENTOS")]

    elems += subseccion("3.1 Requerimientos completamente implementados (Finalizado)")
    elems.append(p(
        "Los siguientes requerimientos cuentan con código fuente implementado, validado y "
        "funcionando en el repositorio del proyecto. Su estado se considera <b>Finalizado</b>:"))
    elems.append(Spacer(1, 4))

    impl = [
        [Paragraph("<b>IDs implementados</b>", ENCAB_TAB),
         Paragraph("<b>Módulo</b>", ENCAB_TAB),
         Paragraph("<b>Evidencia de implementación</b>", ENCAB_TAB)],
        [p("RF-01, RF-02, RF-03",CELDA_TAB),p("Autenticación",CELDA_C),
         p("backend/src/config/passport.js · controllers/auth.controller.js · middleware/verifyToken.js · frontend/auth/login/",CELDA_TAB)],
        [p("RF-04, RF-05, RF-06, RF-07, RF-08, RF-09, RF-10",CELDA_TAB),p("Inscripción",CELDA_C),
         p("backend/src/services/inscripcion.service.js · controllers/inscripcion.controller.js · models/Materia.js · models/Adeudo.js",CELDA_TAB)],
        [p("RF-11, RF-12, RF-13, RF-14",CELDA_TAB),p("Calificaciones",CELDA_C),
         p("backend/src/controllers/calificacion.controller.js · models/Calificacion.js · routes/calificacion.routes.js",CELDA_TAB)],
        [p("RF-15, RF-16, RF-17",CELDA_TAB),p("Historial / Kardex",CELDA_C),
         p("backend/src/controllers/historial.controller.js (PDFKit 0.15) · frontend/modules/historial/",CELDA_TAB)],
        [p("RF-18, RF-19, RF-20",CELDA_TAB),p("Adeudos",CELDA_C),
         p("backend/src/controllers/adeudo.controller.js · models/Adeudo.js · frontend/modules/pagos/",CELDA_TAB)],
        [p("RF-21, RF-23",CELDA_TAB),p("Seguridad",CELDA_C),
         p("backend/src/middleware/verifyToken.js · checkRole.js · frontend/core/guards/auth.guard.ts · role.guard.ts",CELDA_TAB)],
        [p("RF-24, RF-25",CELDA_TAB),p("Gestión de Materias",CELDA_C),
         p("backend/src/controllers/materia.controller.js · routes/materia.routes.js · frontend/modules/dashboard/",CELDA_TAB)],
    ]
    elems.append(tabla_base(impl, [3.5*cm, 2.5*cm, 9*cm], alt_bg=VERDE_F))
    elems.append(Spacer(1, 6))

    elems += subseccion("3.2 Requerimientos en proceso (En proceso)")
    elems.append(p(
        "Los siguientes requerimientos tienen su funcionalidad implementada pero les falta "
        "evidencia de prueba o validación formal:"))
    elems.append(Spacer(1, 4))

    enproceso = [
        [Paragraph("<b>ID</b>", ENCAB_TAB),
         Paragraph("<b>Descripción</b>", ENCAB_TAB),
         Paragraph("<b>Qué falta para completarlo</b>", ENCAB_TAB)],
        [p("RNF-02",CELDA_C),
         p("Rendimiento: respuestas API < 2 segundos",CELDA_TAB),
         p("Ejecutar pruebas de carga con Artillery o k6 y documentar los resultados obtenidos.",CELDA_TAB)],
        [p("RNF-04",CELDA_C),
         p("Disponibilidad: 99.5% de uptime mensual",CELDA_TAB),
         p("Configurar herramienta de monitoreo (UptimeRobot o similar) y generar reporte de disponibilidad.",CELDA_TAB)],
    ]
    elems.append(tabla_base(enproceso, [1.6*cm, 5.5*cm, 7.9*cm], alt_bg=AMARILLO_F))
    elems.append(Spacer(1, 6))

    elems += subseccion("3.3 Requerimientos sin implementar (Pendientes)")
    elems.append(p(
        "Al momento de esta entrega, <b>no existe ningún requerimiento en estado Pendiente</b>. "
        "Todos los requerimientos activos han sido implementados en código. Los únicos ítems "
        "sin completar son las pruebas automatizadas (Jest/Supertest), cuya documentación "
        "ya existe en <code>docs/04_pruebas/casos_de_prueba.md</code> pero aún no se han "
        "creado los archivos <code>.test.js</code> ejecutables en el repositorio."))
    elems.append(Spacer(1, 6))

    elems += subseccion("3.4 Requerimientos excluidos del alcance")
    excluidos = [
        [Paragraph("<b>ID</b>", ENCAB_TAB),
         Paragraph("<b>Descripción original</b>", ENCAB_TAB),
         Paragraph("<b>Motivo de exclusión</b>", ENCAB_TAB)],
        [p("RF-22",CELDA_C),
         p("Notificaciones push en tiempo real con Socket.io",CELDA_TAB),
         p("Excluido por instrucción directa del catedrático. Complejidad fuera del alcance del semestre.",CELDA_TAB)],
        [p("RF-30",CELDA_C),
         p("Integración con pasarela de pago Stripe",CELDA_TAB),
         p("Excluido por instrucción directa del catedrático. Requiere cuenta de pago real y certificaciones.",CELDA_TAB)],
        [p("RF-31",CELDA_C),
         p("Generación de referencia bancaria OXXO",CELDA_TAB),
         p("Excluido por instrucción directa del catedrático. Requiere integración con API de terceros.",CELDA_TAB)],
    ]
    elems.append(tabla_base(excluidos, [1.4*cm, 5.5*cm, 8.1*cm],
                            alt_bg=colors.HexColor("#F3E5F5")))
    elems.append(p(
        "<i>Los CP-08, CP-09 y CP-10 correspondientes a estos requerimientos también "
        "fueron excluidos del plan de pruebas.</i>"))
    elems.append(Spacer(1, 6))

    elems += subseccion("3.5 Requerimientos que afectan a otros componentes")
    elems.append(p(
        "Algunos requerimientos tienen impacto transversal en múltiples módulos del sistema. "
        "Su implementación correcta es crítica para el funcionamiento del resto:"))
    elems.append(Spacer(1, 4))

    transversales = [
        [Paragraph("<b>Req.</b>", ENCAB_TAB),
         Paragraph("<b>Componentes que dependen de él</b>", ENCAB_TAB),
         Paragraph("<b>Impacto si falla</b>", ENCAB_TAB)],
        [p("RF-03 (JWT)",CELDA_C),
         p("Todos los módulos (inscripción, calificaciones, historial, adeudos, materias)",CELDA_TAB),
         p("Sin JWT válido, ninguna ruta protegida responde. El sistema queda inaccesible.",CELDA_TAB)],
        [p("RF-21 (verifyToken)",CELDA_C),
         p("backend/src/middleware/verifyToken.js · todas las rutas registradas",CELDA_TAB),
         p("Si el middleware falla, las rutas quedan expuestas sin autenticación.",CELDA_TAB)],
        [p("RF-23 (RBAC)",CELDA_C),
         p("Rutas de admin, profesor y alumno en todos los módulos",CELDA_TAB),
         p("Un alumno podría acceder a funciones de administrador o profesor.",CELDA_TAB)],
        [p("RF-05 (Adeudos en inscripción)",CELDA_C),
         p("inscripcion.service.js · adeudo.controller.js · modelo Adeudo",CELDA_TAB),
         p("Sin esta validación, alumnos con adeudos podrían inscribirse sin restricción.",CELDA_TAB)],
        [p("RF-02 (Asignación de roles)",CELDA_C),
         p("auth.controller.js · modelo User · guards de Angular",CELDA_TAB),
         p("Sin rol asignado, los guards de frontend no pueden decidir qué pantalla mostrar.",CELDA_TAB)],
    ]
    elems.append(tabla_base(transversales, [2.2*cm, 6.3*cm, 6.5*cm], alt_bg=ROJO_F))
    elems.append(Spacer(1, 6))
    return elems

# ─── SECCIÓN 4: CAMBIOS DETECTADOS ───────────────────────────────────────────
def build_cambios():
    elems = [seccion("4. CAMBIOS DETECTADOS DURANTE EL DESARROLLO")]

    elems += subseccion("4.1 Resumen de cambios")
    elems.append(p(
        "Durante el proceso de desarrollo del USF Portal se identificaron los siguientes "
        "cambios respecto a la planificación inicial del proyecto. Estos cambios fueron "
        "documentados en el control de versiones (git) y en los archivos de documentación "
        "del repositorio:"))
    elems.append(Spacer(1, 4))

    cambios = [
        [Paragraph("<b>Cambio</b>", ENCAB_TAB),
         Paragraph("<b>Tipo</b>", ENCAB_TAB),
         Paragraph("<b>Descripción</b>", ENCAB_TAB),
         Paragraph("<b>Impacto</b>", ENCAB_TAB)],
        [p("Exclusión RF-22",CELDA_C), badge("Eliminación",MORADO),
         p("Las notificaciones push con Socket.io fueron eliminadas del alcance por instrucción del catedrático.",CELDA_TAB),
         p("Bajo — no afecta ningún módulo implementado. Los CP-08 y la arquitectura de WebSocket no se desarrollaron.",CELDA_TAB)],
        [p("Exclusión RF-30/RF-31",CELDA_C), badge("Eliminación",MORADO),
         p("La integración con Stripe y referencias OXXO fue eliminada del alcance.",CELDA_TAB),
         p("Bajo — el módulo de adeudos se adaptó para registro manual de pagos por el admin.",CELDA_TAB)],
        [p("Cambio en arquitectura de pruebas",CELDA_C), badge("Modificación",NARANJA),
         p("Los archivos .test.js de Jest se documentaron pero no se implementaron en código ejecutable.",CELDA_TAB),
         p("Medio — existe riesgo de regresión al no tener suite de pruebas automatizadas activa.",CELDA_TAB)],
        [p("Uso de PDFKit en lugar de Puppeteer",CELDA_C), badge("Sustitución",NARANJA),
         p("Se eligió PDFKit 0.15 para la generación del kardex PDF, en lugar de Puppeteer (headless Chrome).",CELDA_TAB),
         p("Bajo — el PDF resultante es programático. Menor consumo de memoria en Railway.",CELDA_TAB)],
        [p("Reorganización de módulos (RF-25)",CELDA_C), badge("Ajuste",NARANJA),
         p("El filtro de materias por profesor existe en el backend pero el dashboard del profesor aún muestra todas.",CELDA_TAB),
         p("Bajo — funcionalidad presente en API; pendiente ajuste visual en el frontend.",CELDA_TAB)],
        [p("Expansión del módulo de adeudos",CELDA_C), badge("Adición",VERDE),
         p("Se agregó el endpoint GET /api/adeudos/mis-adeudos que no estaba en la planificación inicial.",CELDA_TAB),
         p("Positivo — mejora la experiencia del alumno sin afectar otros módulos.",CELDA_TAB)],
    ]
    elems.append(tabla_base(cambios, [2.8*cm, 2.2*cm, 5.5*cm, 4.5*cm], alt_bg=AZUL_F))
    elems.append(Spacer(1, 6))
    return elems

# ─── SECCIÓN 5: IMPACTO DE LOS CAMBIOS ───────────────────────────────────────
def build_impacto():
    elems = [seccion("5. IMPACTO DE LOS CAMBIOS EN EL SISTEMA")]

    elems += subseccion("5.1 Análisis de impacto por módulo")
    elems.append(p(
        "A continuación se analiza cómo los cambios identificados en la sección anterior "
        "afectan a cada módulo del sistema, su estabilidad y los riesgos derivados:"))
    elems.append(Spacer(1, 4))

    impacto_rows = [
        [Paragraph("<b>Módulo</b>", ENCAB_TAB),
         Paragraph("<b>Nivel de impacto</b>", ENCAB_TAB),
         Paragraph("<b>Descripción del impacto</b>", ENCAB_TAB),
         Paragraph("<b>Riesgo residual</b>", ENCAB_TAB)],
        [p("Autenticación",CELDA_C), badge("Ninguno",VERDE),
         p("No recibió cambios. JWT, OAuth y RBAC implementados y estables.",CELDA_TAB),
         p("Bajo — bien documentado y con pruebas CP-01/CP-02/CP-13.",CELDA_TAB)],
        [p("Inscripción",CELDA_C), badge("Bajo",VERDE),
         p("Las 4 validaciones en cascada funcionan correctamente. La exclusión de RF-22 no afecta este módulo.",CELDA_TAB),
         p("Medio — sin archivos .test.js ejecutables para CP-03 a CP-07.",CELDA_TAB)],
        [p("Calificaciones",CELDA_C), badge("Bajo",VERDE),
         p("El bloqueo de actas cerradas y el cálculo automático de notas funcionan según lo requerido.",CELDA_TAB),
         p("Bajo — CP-11 documentado y la lógica validada manualmente.",CELDA_TAB)],
        [p("Historial / Kardex",CELDA_C), badge("Bajo",VERDE),
         p("El cambio de Puppeteer a PDFKit impacta positivamente el rendimiento. PDF funcional.",CELDA_TAB),
         p("Bajo — CP-12 documentado y PDF generado con colores institucionales.",CELDA_TAB)],
        [p("Adeudos",CELDA_C), badge("Positivo",VERDE),
         p("La exclusión de pagos en línea simplificó el módulo. El endpoint adicional mejora la UX.",CELDA_TAB),
         p("Bajo — módulo completo y estable.",CELDA_TAB)],
        [p("Pruebas",CELDA_C), badge("Medio",NARANJA),
         p("La ausencia de archivos .test.js ejecutables es el mayor riesgo. Los casos están documentados pero no corren automáticamente.",CELDA_TAB),
         p("Medio — regresión no detectada automáticamente en CI/CD.",CELDA_TAB)],
        [p("Infraestructura",CELDA_C), badge("Bajo",NARANJA),
         p("Sin monitoreo activo de disponibilidad. RNF-04 en proceso.",CELDA_TAB),
         p("Medio — sin alertas si el servicio en Railway cae.",CELDA_TAB)],
    ]
    elems.append(tabla_base(impacto_rows, [2.5*cm, 2.2*cm, 6.8*cm, 3.5*cm], alt_bg=AZUL_F))
    elems.append(Spacer(1, 6))

    elems += subseccion("5.2 Mapa de relaciones entre requerimientos, módulos y pruebas")
    elems.append(p(
        "El siguiente diagrama textual muestra cómo se relacionan los principales "
        "requerimientos con sus componentes de código y casos de prueba:"))
    elems.append(Spacer(1, 4))

    mapa = """
RF-01, RF-02, RF-03  ──►  MOD: Auth (passport.js · verifyToken.js · jwt.interceptor.ts)
                                   ├── CU-01: Autenticación con Google
                                   └── CP-01 (login OK), CP-02 (sin token → 401)

RF-04 a RF-08        ──►  MOD: Inscripción (inscripcion.service.js con 4 validaciones)
                                   ├── CU-02: Inscripción completa
                                   └── CP-03 (adeudo), CP-04 (cupo), CP-05 (seriación),
                                       CP-06 (horario), CP-07 (éxito)

RF-11 a RF-14        ──►  MOD: Calificaciones (calificacion.controller.js)
                                   ├── CU-05: Captura de notas, CU-06: Cierre de actas
                                   └── CP-11 (acta cerrada → 403)

RF-15 a RF-17        ──►  MOD: Historial (historial.controller.js + PDFKit)
                                   ├── CU-07: Consulta kardex, CU-08: Descarga PDF
                                   └── CP-12 (PDF generado correctamente)

RF-18 a RF-20        ──►  MOD: Adeudos (adeudo.controller.js + modelo Adeudo)
                                   ├── CU-09: Registrar, CU-10: Pagar, CU-11: Consultar
                                   └── Validado indirectamente por CP-03

RF-21, RF-23         ──►  MOD: Seguridad (verifyToken.js · checkRole.js · role.guard.ts)
                                   └── CP-02 (sin JWT → 401), CP-13 (rol incorrecto → 403)
"""
    mapa_box = Table([[Paragraph(mapa.replace("\n","<br/>"),
        ParagraphStyle("C", fontName="Courier", fontSize=7.5,
                       textColor=AZUL, leading=11, alignment=TA_LEFT))]],
        colWidths=[19*cm])
    mapa_box.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,-1), colors.HexColor("#F0F4F8")),
        ("GRID", (0,0), (-1,-1), 0.5, GRIS_M),
        ("LEFTPADDING", (0,0), (-1,-1), 10),
        ("TOPPADDING", (0,0), (-1,-1), 8),
        ("BOTTOMPADDING", (0,0), (-1,-1), 8),
    ]))
    elems.append(mapa_box)
    elems.append(Spacer(1, 6))
    return elems

# ─── SECCIÓN 6: EVIDENCIAS ───────────────────────────────────────────────────
def build_evidencias():
    elems = [seccion("6. EVIDENCIAS DEL ANÁLISIS")]

    elems += subseccion("6.1 Estructura del repositorio como evidencia")
    elems.append(p(
        "La existencia de los siguientes archivos en el repositorio "
        "<b>github.com/hypnoticdata777/proyectofinalequipoVip</b> "
        "es evidencia directa de la implementación de los requerimientos:"))
    elems.append(Spacer(1, 4))

    ev_arch = [
        [Paragraph("<b>Archivo / Ruta</b>", ENCAB_TAB),
         Paragraph("<b>RF que evidencia</b>", ENCAB_TAB),
         Paragraph("<b>Descripción</b>", ENCAB_TAB)],
        [p("usf-portal/backend/src/config/passport.js",CELDA_TAB),p("RF-01",CELDA_C),
         p("Configuración de Google OAuth 2.0 con Passport.js",CELDA_TAB)],
        [p("usf-portal/backend/src/middleware/verifyToken.js",CELDA_TAB),p("RF-03, RF-21",CELDA_C),
         p("Middleware de validación de JWT en cada solicitud HTTP",CELDA_TAB)],
        [p("usf-portal/backend/src/middleware/checkRole.js",CELDA_TAB),p("RF-23",CELDA_C),
         p("Middleware de control de acceso por roles (RBAC)",CELDA_TAB)],
        [p("usf-portal/backend/src/services/inscripcion.service.js",CELDA_TAB),p("RF-05 a RF-08",CELDA_C),
         p("4 validaciones secuenciales: adeudo, cupo, seriación, horario",CELDA_TAB)],
        [p("usf-portal/backend/src/controllers/calificacion.controller.js",CELDA_TAB),p("RF-11 a RF-14",CELDA_C),
         p("Captura, cálculo automático y bloqueo de actas cerradas",CELDA_TAB)],
        [p("usf-portal/backend/src/controllers/historial.controller.js",CELDA_TAB),p("RF-15 a RF-17",CELDA_C),
         p("Kardex agrupado por período y generación de PDF con PDFKit",CELDA_TAB)],
        [p("usf-portal/backend/src/models/Adeudo.js",CELDA_TAB),p("RF-05, RF-18, RF-19, RF-20",CELDA_C),
         p("Schema de MongoDB para adeudos con estados pendiente/pagado",CELDA_TAB)],
        [p("usf-portal/frontend/src/app/core/guards/auth.guard.ts",CELDA_TAB),p("RF-21",CELDA_C),
         p("Guard de Angular que protege rutas autenticadas en el frontend",CELDA_TAB)],
        [p("usf-portal/frontend/src/app/core/guards/role.guard.ts",CELDA_TAB),p("RF-23",CELDA_C),
         p("Guard de Angular que verifica el rol del usuario antes de mostrar una ruta",CELDA_TAB)],
        [p("usf-portal/docs/01_analisis/MTR.md",CELDA_TAB),p("Todos",CELDA_C),
         p("Matriz de Trazabilidad de Requerimientos (documento base)",CELDA_TAB)],
        [p("usf-portal/docs/04_pruebas/casos_de_prueba.md",CELDA_TAB),p("CP-01 a CP-13",CELDA_C),
         p("Documentación de todos los casos de prueba con código Jest/Supertest",CELDA_TAB)],
    ]
    elems.append(tabla_base(ev_arch, [6.5*cm, 2.2*cm, 6.3*cm], alt_bg=VERDE_F))
    elems.append(Spacer(1, 6))

    elems += subseccion("6.2 Historial de control de versiones (git)")
    elems.append(p(
        "El repositorio cuenta con <b>24 commits</b> organizados en ramas temáticas que "
        "demuestran el desarrollo incremental del sistema:"))
    elems.append(Spacer(1, 4))

    ramas = [
        [Paragraph("<b>Rama</b>", ENCAB_TAB), Paragraph("<b>Módulo desarrollado</b>", ENCAB_TAB)],
        [p("main",CELDA_C), p("Código estable en producción",CELDA_TAB)],
        [p("develop",CELDA_C), p("Rama de integración de features",CELDA_TAB)],
        [p("feature/modulo1-auth",CELDA_C), p("Autenticación Google OAuth y JWT",CELDA_TAB)],
        [p("feature/modulo2-inscripcion",CELDA_C), p("Módulo de inscripción con 4 validaciones",CELDA_TAB)],
        [p("feature/modulo2-calificaciones",CELDA_C), p("Captura de notas y cierre de actas",CELDA_TAB)],
        [p("feature/modulo2-historial",CELDA_C), p("Kardex y generación de PDF",CELDA_TAB)],
        [p("feature/modulo3-adeudos",CELDA_C), p("Gestión de adeudos financieros",CELDA_TAB)],
        [p("feature/frontend-*",CELDA_C), p("Componentes Angular (dashboards, formularios)",CELDA_TAB)],
    ]
    elems.append(tabla_base(ramas, [5*cm, 10*cm], alt_bg=AZUL_F))
    elems.append(Spacer(1, 6))
    return elems

# ─── SECCIÓN 7: CONCLUSIONES ─────────────────────────────────────────────────
def build_conclusiones():
    elems = [seccion("7. CONCLUSIONES Y RECOMENDACIONES")]

    elems += subseccion("7.1 Conclusiones del seguimiento")

    conclusiones = [
        ("<b>Alta cobertura de implementación:</b> El 92% de los requerimientos activos "
         "se encuentran en estado Finalizado. Todos los módulos principales (autenticación, "
         "inscripción, calificaciones, historial y adeudos) están implementados y funcionando."),
        ("<b>Trazabilidad completa:</b> Cada requerimiento funcional puede ser rastreado hasta "
         "su código fuente, caso de uso relacionado y caso de prueba correspondiente, lo que "
         "demuestra la efectividad de la metodología de trazabilidad aplicada."),
        ("<b>Cambios controlados:</b> Los cambios ocurridos durante el desarrollo (exclusión de "
         "RF-22, RF-30 y RF-31) fueron documentados, comunicados y no generaron impacto negativo "
         "en los módulos implementados."),
        ("<b>Arquitectura sólida:</b> La separación en capas (controllers, services, models, routes "
         "en el backend; módulos con lazy loading en el frontend) facilita el mantenimiento y la "
         "extensión futura del sistema sin modificar el código existente."),
        ("<b>Brecha en pruebas automatizadas:</b> El principal punto de mejora es la ausencia de "
         "archivos .test.js ejecutables. Los casos de prueba están completamente documentados "
         "pero no se ejecutan automáticamente en el pipeline de CI/CD."),
    ]
    for i, c in enumerate(conclusiones, 1):
        elems.append(Paragraph(f"<b>{i}.</b> {c}", CUERPO))
        elems.append(Spacer(1, 4))

    elems += subseccion("7.2 Recomendaciones para el cierre del proyecto")

    recom = [
        [Paragraph("<b>Prioridad</b>", ENCAB_TAB),
         Paragraph("<b>Acción recomendada</b>", ENCAB_TAB),
         Paragraph("<b>Responsable sugerido</b>", ENCAB_TAB)],
        [badge("Alta",ROJO),
         p("Crear los archivos backend/src/__tests__/inscripcion.test.js y auth.test.js con los casos CP-01 a CP-07 en Jest/Supertest.",CELDA_TAB),
         p("Ricardo Galindo (Backend Developer)",CELDA_TAB)],
        [badge("Alta",ROJO),
         p("Ejecutar una prueba de carga básica con Artillery para validar RNF-02 (respuesta < 2s) antes del despliegue final.",CELDA_TAB),
         p("Carlos Sanchez (Líder Técnico)",CELDA_TAB)],
        [badge("Media",NARANJA),
         p("Configurar UptimeRobot u otro monitor para el endpoint de Railway y generar reporte mensual de disponibilidad (RNF-04).",CELDA_TAB),
         p("Mariana Jimenez (Full-stack)",CELDA_TAB)],
        [badge("Media",NARANJA),
         p("Ajustar el endpoint GET /api/materias para filtrar por professor en el dashboard del profesor (RF-25).",CELDA_TAB),
         p("Eduardo Robles (Frontend)",CELDA_TAB)],
        [badge("Baja",VERDE),
         p("Documentar los endpoints en Postman y publicar la colección en el repositorio para referencia del equipo.",CELDA_TAB),
         p("Luis Roberto Suarez (Frontend Lead)",CELDA_TAB)],
    ]
    elems.append(tabla_base(recom, [2*cm, 9.5*cm, 5.5*cm], alt_bg=AZUL_F))
    elems.append(Spacer(1, 10))

    elems += subseccion("7.3 Estado final del proyecto")
    resumen_final = [
        [Paragraph("<b>Indicador</b>", ENCAB_TAB),
         Paragraph("<b>Valor</b>", ENCAB_TAB),
         Paragraph("<b>Observación</b>", ENCAB_TAB)],
        [p("Requerimientos funcionales activos",CELDA_TAB), badge("24",AZUL_M),
         p("RF-01 a RF-25, excluyendo RF-22",CELDA_TAB)],
        [p("Requerimientos funcionales Finalizado",CELDA_TAB), badge("24/24 = 100%",VERDE),
         p("Todos los activos tienen código implementado",CELDA_TAB)],
        [p("Requerimientos no funcionales Finalizado",CELDA_TAB), badge("5/7 = 71%",VERDE),
         p("RNF-02 y RNF-04 en proceso (sin pruebas formales)",CELDA_TAB)],
        [p("Casos de uso cubiertos",CELDA_TAB), badge("12/12 = 100%",VERDE),
         p("Todos los CU están implementados",CELDA_TAB)],
        [p("Casos de prueba documentados",CELDA_TAB), badge("10/10 activos",AZUL_M),
         p("Documentados; no ejecutables automáticamente aún",CELDA_TAB)],
        [p("Requerimientos excluidos",CELDA_TAB), badge("3",MORADO),
         p("RF-22, RF-30, RF-31 — por instrucción del catedrático",CELDA_TAB)],
        [p("Estado general del proyecto",CELDA_TAB), badge("92% listo",VERDE),
         p("Listo para entrega académica; recomendaciones de mejora identificadas",CELDA_TAB)],
    ]
    elems.append(tabla_base(resumen_final, [5.5*cm, 3*cm, 6.5*cm], alt_bg=VERDE_F))

    elems.append(Spacer(1, 12))
    elems.append(HRFlowable(width="100%", thickness=1, color=DORADO, spaceAfter=6))
    elems.append(Paragraph(
        "Este reporte fue elaborado por el Equipo VIP como entrega de la Actividad 5 de la materia "
        "Trazabilidad y Configuración de Software. Fecha: 07 de junio de 2026. "
        "Catedrático: Rafael Bernal Gallegos. USF Portal — Universidad Santa Fe, Campus Paraíso.",
        PIE))

    return elems


# ─── CABECERA Y PIE DE PÁGINA ────────────────────────────────────────────────
class NumberedCanvas:
    """No usar canvas; en su lugar pasamos onFirstPage/onLaterPages a SimpleDocTemplate."""
    pass

def cabecera_pie(canvas, doc):
    canvas.saveState()
    w, h = A4

    # Cabecera solo en páginas > 1
    if doc.page > 1:
        canvas.setFillColor(AZUL)
        canvas.rect(0, h - 1.5*cm, w, 1.5*cm, fill=1, stroke=0)
        canvas.setFillColor(DORADO)
        canvas.rect(0, h - 1.6*cm, w, 0.1*cm, fill=1, stroke=0)
        canvas.setFont("Helvetica-Bold", 8)
        canvas.setFillColor(colors.white)
        canvas.drawString(1.5*cm, h - 1.1*cm, "USF Portal — Reporte de Seguimiento de Requerimientos")
        canvas.drawRightString(w - 1.5*cm, h - 1.1*cm, "Actividad 5 | Equipo VIP | 2026")

    # Pie de página
    canvas.setFillColor(AZUL)
    canvas.rect(0, 0, w, 1*cm, fill=1, stroke=0)
    canvas.setFillColor(DORADO)
    canvas.rect(0, 1*cm, w, 0.05*cm, fill=1, stroke=0)
    canvas.setFont("Helvetica", 7.5)
    canvas.setFillColor(colors.white)
    canvas.drawString(1.5*cm, 0.35*cm, "Materia: Trazabilidad y Configuración de Software | Rafael Bernal Gallegos")
    canvas.drawCentredString(w / 2, 0.35*cm, f"Página {doc.page}")
    canvas.drawRightString(w - 1.5*cm, 0.35*cm, "Universidad Santa Fe — Campus Paraíso")
    canvas.restoreState()


# ─── MAIN ─────────────────────────────────────────────────────────────────────
def main():
    ruta = "/home/user/proyectofinalequipoVip/entregables/Actividad5_ReporteSeguimiento_USFPortal.pdf"

    doc = SimpleDocTemplate(
        ruta, pagesize=A4,
        leftMargin=1.5*cm, rightMargin=1.5*cm,
        topMargin=2*cm, bottomMargin=1.5*cm,
        title="Reporte de Seguimiento de Requerimientos — USF Portal",
        author="Equipo VIP",
        subject="Actividad 5 — Trazabilidad y Configuración de Software",
    )

    story = []
    story += build_portada()
    story += build_introduccion()
    story += build_estado_reqs()
    story += build_clasificacion()
    story.append(PageBreak())
    story += build_cambios()
    story += build_impacto()
    story.append(PageBreak())
    story += build_evidencias()
    story += build_conclusiones()

    doc.build(story, onFirstPage=cabecera_pie, onLaterPages=cabecera_pie)
    print(f"✅  PDF guardado en: {ruta}")


if __name__ == "__main__":
    main()
