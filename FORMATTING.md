# Guía de Formateo de Código

Este proyecto usa **Prettier** y **ESLint** para mantener un código consistente y bien formateado.

## Herramientas Instaladas

- **Prettier**: Formateador automático de código
- **ESLint**: Linter para detectar errores y problemas de código
- **eslint-config-prettier**: Integra Prettier con ESLint
- **eslint-plugin-prettier**: Ejecuta Prettier como regla de ESLint

## Configuración

### Prettier
- Archivo de configuración: `.prettierrc.json`
- Archivos ignorados: `.prettierignore`

### Reglas de Formateo
- **Comillas**: Dobles (`"`) para strings
- **Punto y coma**: Sí (`;`)
- **Ancho de línea**: 80 caracteres
- **Indentación**: 2 espacios
- **Final de línea**: LF (Unix)

## Comandos Disponibles

### Formatear todo el código
```bash
pnpm format
```
Formatea todos los archivos en `src/` según las reglas de Prettier.

### Verificar formato (sin cambiar)
```bash
pnpm format:check
```
Verifica si el código está formateado correctamente sin hacer cambios.

### Linter
```bash
pnpm lint
```
Ejecuta ESLint para detectar problemas de código.

### Linter con auto-fix
```bash
pnpm lint:fix
```
Ejecuta ESLint y corrige automáticamente los problemas que puede resolver.

## Configuración del Editor (VS Code / Cursor)

Para que el código se formatee automáticamente al guardar:

1. Instala la extensión **Prettier - Code formatter**
2. Instala la extensión **ESLint**
3. Agrega esta configuración a tu `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[javascriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[json]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[css]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

## Formatear Todo el Proyecto Ahora

Si quieres formatear todos los archivos existentes:

```bash
pnpm format
```

Esto formateará todos los archivos según las reglas configuradas.

## Notas

- Los archivos en `dist/`, `node_modules/`, y otros directorios de build están ignorados
- Los archivos de configuración como `vite.config.ts` también están ignorados
- El formateo es automático al guardar si tienes las extensiones instaladas
