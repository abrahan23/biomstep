# Imágenes de categorías — Higgsfield

Estilo común (añadir al inicio de cada prompt):

```
Editorial clinical product photography, soft studio light from top-left, matte light-grey concrete backdrop with subtle teal #14b8a6 rim light, shallow depth of field, fine medical aesthetic, premium ecommerce framing, slight cool color grading, no people, no text, no logos, 4:5 portrait, ultra-detailed.
```

## Archivos esperados en `public/images/categories/`

| Categoría | Archivo |
|-----------|---------|
| Plantillas | `insoles.png` (o `.webp` si exportas desde Higgsfield) |
| Protecciones deportivas | `sport-protection.png` |
| Modelos anatómicos | `anatomical-models.png` |
| Biomstep Lab | `biomstep-lab.png` |

## Prompts por categoría

### 1. Plantillas → `insoles.webp`

```
A single pair of premium custom orthopedic insoles floating slightly above a clean light-stone surface, sculpted ergonomic shape, soft silicone-and-EVA hybrid material in warm off-white with subtle teal accent line along the arch, gentle drop shadow, anatomical heel cup detail visible, minimalist composition, centered.
```

### 2. Protecciones deportivas → `sport-protection.webp`

```
A compact still-life of athletic foot protection: ankle brace and metatarsal pad arranged in soft asymmetry on a pale concrete slab, technical mesh and neoprene textures, breathable seams visible, subtle teal stitching, clinical-sport hybrid look, no logos, soft top-down rim light.
```

### 3. Modelos anatómicos → `anatomical-models.webp`

```
A 3D-printed white anatomical foot bone model standing on a small black acrylic base, fine PLA layer lines barely visible, soft studio shadow, scientific museum quality, small measuring caliper out of focus in the background, clinical-research mood.
```

### 4. Biomstep Lab → `biomstep-lab.webp`

```
Top-down flatlay of podiatric lab tools on a brushed aluminum tray: precision caliper, small dental-style probe, 3D-printed prototype foot insert, white nitrile gloves edge, subtle teal cable of a desktop 3D printer in the corner, ultra-clean lab aesthetic, soft cool light.
```

## Después de exportar desde Higgsfield

1. Exportar **WebP 1200×1500** (4:5), calidad ~82.
2. Guardar en `public/images/categories/` con los nombres de la tabla.
3. Sincronizar BD: `pnpm db:seed`
4. Revalidar caché si hace falta: visitar `/api/revalidate` en dev.

## Generación vía MCP (Cursor)

Modelo recomendado: `marketing_studio_image`, aspect ratio `4:5`.

Si falla con *Invalid or expired token*, reconecta el plugin Higgsfield en **Cursor → Settings → MCP** y vuelve a pedir la generación.
