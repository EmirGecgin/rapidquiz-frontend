const ICONS: Record<string, string> = {
  trophy: '🏆',
  globe: '🌍',
  code: '💻',
  cpu: '🧠',
  landmark: '🏛️',
}

const FALLBACK_ICON = '❓'

export function iconFor(slug: string): string {
  return ICONS[slug] ?? FALLBACK_ICON
}
