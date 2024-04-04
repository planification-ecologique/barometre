// import analytics_config_file from '../services/dsfr_analytics_config.js'
export function dsfrAnalytics (params = {}) {

    try {
        if(_EA_disabled() != 1){
                       
            window.EA_datalayer = [];            
            // Informations de page :
            window.EA_datalayer.push('page_path', params.path);
            window.EA_datalayer.push('page_name', params.name);
            window.EA_datalayer.push('site-segment', params.segment);
            window.EA_datalayer.push('page_template', params.template);
            window.EA_datalayer.push('pagegroup', params.group);
            window.EA_datalayer.push('pagelabel', params.labels);
            window.EA_datalayer.push('page_date', get_data());

            // Informations de site :
            window.EA_datalayer.push('site_entity', 'Premier Ministre');
            window.EA_datalayer.push('site_environment', process.env.VUE_APP_ENV);
            window.EA_datalayer.push('site_target', 'information');
            window.EA_datalayer.push('site_type', 'standard');

            if ("isError" in params){
                window.EA_datalayer.push('page_isError', params.isError);
            }

            // Envoi des données :
            window.EA_push(window.EA_datalayer); 
        }

    } catch (error) {
        console.error('Error: ', error)
    }
}
export default dsfrAnalytics

export function get_data () {    
    var newdate = new Date()
    newdate.setDate( (new Date()).getDate() )    
    return newdate.toISOString().split('T')[0]    
}