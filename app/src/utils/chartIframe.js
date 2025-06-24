/**
 * Generates an iframe URL for embedding a chart
 * @param {Object} chartData - The chart data object
 * @param {Object} options - Additional options for the iframe
 * @param {number} options.width - Width of the iframe in pixels
 * @param {number} options.height - Height of the iframe in pixels
 * @returns {string} The iframe HTML string
 */
export function generateChartIframe(chartData, options = {}) {
  const { width = 800, height = 400 } = options
  const baseUrl = import.meta.env?.VITE_APP_URL || window.location.origin
  const url = `${baseUrl}/chart-iframe?id=${chartData.id}`
  
  return `<iframe 
    src="${url}"
    style="width: ${width}px; height: ${height}px; border: none;"
    frameborder="0" 
    allowfullscreen
  ></iframe>`
}
