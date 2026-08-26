/**
 * Minimal declaration for Vite's `import.meta.glob`, used by the mock-REST
 * catalog loader. Declared locally instead of pulling in `vite/client`, whose
 * asset module declarations collide with `next-env.d.ts`.
 */
interface ImportMeta {
  glob: (
    pattern: string,
    options?: { eager?: boolean; import?: string }
  ) => Record<string, unknown>
}
