# AdOptimizer · Versión web para Vercel

Sitio web estático: los modelos (Random Forest, AdaBoost y el regresor de ventas) se exportaron a
`modelos.json` y se ejecutan en el navegador con `motor.js`. No necesita servidor Python.

Archivos: index.html · motor.js · modelos.json · data.json · vercel.json

## Publicar en Vercel (sin instalar nada)
1. Cree un repositorio nuevo en https://github.com/new (público), por ejemplo `adoptimizer`.
2. En el repositorio: "uploading an existing file" → arrastre los 5 archivos de esta carpeta → "Commit changes".
3. Entre a https://vercel.com con su cuenta de GitHub → "Add New…" → "Project" → importe el repositorio.
4. Framework Preset: **Other**. No cambie nada más → **Deploy**.
5. Vercel le da la URL pública: https://adoptimizer-xxxx.vercel.app

## Regenerar (si reentrena los modelos)
python src/pipeline.py --data data/data.csv
python src/exportar_web.py
