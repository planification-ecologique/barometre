import {
  hasActiveTrendLine,
  hasTargetTrajectoryDisplay,
  listIndicatorAuxLegendFlags,
  resolveIndicatorOverlays
} from '@/utils/chartOverlays.js'

export const SYNTHESIS_TREND_LEGEND_LABEL = 'Rythme actuel (3 ans)'
export const SYNTHESIS_TARGET_LEGEND_LABEL = 'Cible(s)'
export const SYNTHESIS_TREND_LEGEND_COLOR = '#6a6156'
export const SYNTHESIS_TARGET_LEGEND_COLOR = '#000091'
export const SYNTHESIS_TREND_LEGEND_TITLE =
  'Droite de tendance par régression linéaire sur les 3 dernières années de données mesurées, prolongée jusqu\'en 2035. Lecture indicative par rapport à la cible.'

export { hasActiveTrendLine, hasTargetTrajectoryDisplay }

/** Whether an indicator row would show trend / target overlays in MiniChart. */
export function indicatorAuxChartLegend (indicator) {
  return resolveIndicatorOverlays(indicator).auxLegend
}

/** Aggregate flags for a synthesis table (sector or axe). */
export function listShowsAuxChartLegend (indicators) {
  return listIndicatorAuxLegendFlags(indicators)
}
