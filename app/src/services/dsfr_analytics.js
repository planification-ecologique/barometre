export function dsfrAnalytics (params = {}) {
    try {
        window.dsfr.analytics.page.path = params.path
        window.dsfr.analytics.page.title = params.title
        window.dsfr.analytics.page.name = params.name
        window.dsfr.analytics.page.theme =  params.theme
    } catch (error) {
        console.error('Error: ', error)
    }
}
