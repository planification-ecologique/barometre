import analytics_config_file from '../services/dsfr_analytics_config.js'
export function dsfrAnalytics (params = {}) {
    try {
        window.dsfr.analytics.page.path = params.path  
        window.dsfr.analytics.page.name = params.name
        window.dsfr.analytics.page.segment = params.segment
        window.dsfr.analytics.page.template = params.template
        window.dsfr.analytics.page.group = params.group
        if ("isError" in params){
            window.dsfr.analytics.page.isError = params.isError
        }
        
        analytics_config_file.analytics.page.labels = params.labels
        window.dsfr = analytics_config_file
    } catch (error) {
        console.error('Error: ', error)
    }
}
export default dsfrAnalytics