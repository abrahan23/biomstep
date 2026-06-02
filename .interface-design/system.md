# BIOMSTEP — Home Design System

## Direction: Clinical Precision & Trust

**Domain:** pisada, plantilla ortopédica, biomecánica, consultorio podológico, impresión 3D, rendimiento deportivo.

**Color world:** teal clínico (hero), hueso cálido, slate de consultorio, acero quirúrgico, negro profundo del vídeo.

**Signature:** Secciones numeradas (01–05) con contador monospace y línea degradada teal — continuidad editorial tras el hero cinematográfico.

**Rejecting:**
- Gradientes arcoíris por categoría → variaciones solo dentro de la familia teal/cyan
- Cards genéricas con sombra fuerte → elevación por bordes sutiles y cambios de superficie
- Blobs decorativos → espacio en blanco y ritmo tipográfico

## Tokens (home sections)

| Token | Value | Use |
|-------|-------|-----|
| `--biom-teal` | `174 58% 38%` | Acento, líneas, iconos |
| `--biom-bone` | `40 20% 98%` | Superficies alternas |
| `--biom-ink` | `210 24% 12%` | Texto principal |
| `--biom-muted` | `210 12% 46%` | Texto secundario |
| `--biom-border` | `210 16% 90%` | Separadores |

## Depth

Borders-only + surface shifts. Sin sombras dramáticas. Hover: borde teal/20, no translate-y exagerado.

## Typography

- **UI + títulos:** Plus Jakarta Sans (`font-sans` / `font-heading`) — misma familia; títulos en 600–800
- **Data/labels:** Geist Mono (`font-mono`) — números de sección, precios, contadores
- **Escala display:** `text-display-sm` / `text-display` / `text-display-lg` con `tracking-display`
- **Overlines:** `tracking-overline` en eyebrows y badges de sección

## Spacing

Base 8px. Secciones: `py-16 md:py-20 lg:py-24`. Gap interno: 4–5 (16–20px).

## Component patterns

- **Section header:** número mono + gradiente → eyebrow teal → título heading → descripción muted
- **Category card:** overlay oscuro unificado, imagen desaturada, contador de productos mono
- **Benefit row:** borde izquierdo teal 2px, icono outline
- **Testimonial:** comilla grande decorativa, estrellas teal
- **FAQ:** layout sticky + acordeón con items separados por hairline
