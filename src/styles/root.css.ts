import { style } from "@vanilla-extract/css"
export const layout = style({
  width: `1366px`,
  height: `768px`,

  display: `grid`,
  grid: `
    "sidebar body" 1fr
    / auto 1fr
    `,
  gap: `8px`,
})

export const sidebar = style({ gridArea: `sidebar` })
export const body = style({ gridArea: `body` })
