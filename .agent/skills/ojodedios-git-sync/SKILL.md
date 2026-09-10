---
name: ojodedios-git-sync
description: >-
  Automatiza el ciclo de verificación de código, actualización de documentación
  técnica y despliegue a GitHub / GitHub Pages para el proyecto Ojo de Dios.
---

# Skill: Ojo de Dios - Git & Docs Sync

Usa esta habilidad para sincronizar el repositorio del juego, mantener la documentación al día y desplegar automáticamente las nuevas etapas del proyecto en GitHub Pages.

## Procedimiento de Sincronización

Cada vez que se añadan nuevas características (nuevos elementos celulares, nuevas misiones o sprites):

1. **Verificar Compilación Limpia:**
   Ejecuta el build de Vite para garantizar que no hay errores de sintaxis ni importaciones rotas:
   ```bash
   npm.cmd run build
   ```

2. **Actualizar Documentación:**
   - Si se añadieron nuevas mecánicas o controles, actualiza `README.md`.
   - Si se cambiaron estructuras de datos, componentes o el pipeline de renderizado, actualiza `ARCHITECTURE.md`.

3. **Control de Versiones (Git):**
   - Comprueba los archivos modificados con `git status`.
   - Añade los cambios:
     ```bash
     git add .
     ```
   - Realiza un commit con un mensaje semántico claro en español:
     ```bash
     git commit -m "feat: [descripción de la novedad o etapa]"
     ```
   - Sube los cambios al repositorio remoto:
     ```bash
     git push origin main
     ```

4. **Confirmar Despliegue en GitHub Pages:**
   - El workflow `.github/workflows/deploy.yml` compilará y publicará la nueva versión en:
     `https://annycastro9010-hue.github.io/OjoDeDios/`
