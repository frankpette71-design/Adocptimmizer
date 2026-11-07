AdOptimizer · Versión Web (Serverless)
Sistema analítico para la optimización de campañas publicitarias en Facebook Ads, adaptado como una aplicación web estática de alto rendimiento lista para desplegarse sin servidor Python.

Arquitectura del Proyecto
Los modelos predictivos entrenados previamente (Random Forest, AdaBoost y el regresor de ventas) fueron exportados a formato estructurado (modelos.json) para ejecutarse directamente en el navegador mediante JavaScript (motor.js).

Archivos Principales
index.html: Interfaz de usuario, visualizaciones y paneles interactivos del dashboard.

motor.js: Lógica de inferencia y cálculo ejecutada del lado del cliente.

modelos.json: Pesos, hiperparámetros y estructuras de los modelos serializados.

data.json: Conjunto de datos procesado y listo para consultas rápidas.

vercel.json: Configuración de enrutamiento y despliegue para Vercel.
 
Despliegue en Vercel (Sin Servidor)
Para publicar la aplicación web de forma gratuita y en pocos minutos:

Cree un repositorio público nuevo en GitHub Repositories, por ejemplo: adoptimizer.

En la página del repositorio, seleccione "uploading an existing file", arrastre los 5 archivos de la aplicación y haga clic en "Commit changes".

Inicie sesión en Vercel con su cuenta de GitHub, haga clic en "Add New…" → "Project" e importe el repositorio creado.

En la configuración del proyecto:

Framework Preset: Seleccione Other.

Deje los demás valores por defecto y haga clic en Deploy.
