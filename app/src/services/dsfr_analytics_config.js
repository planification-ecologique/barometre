export const DEFAULT_PROD_TRACKING_DOMAIN = 'phdd.barometre.planification-ecologique.gouv.fr'

export function resolveTrackingDomain () {
  const fromEnv = (process.env.VUE_APP_TRACKING || '').trim()
  if (fromEnv) return fromEnv
  if (process.env.VUE_APP_ENV === 'prod') return DEFAULT_PROD_TRACKING_DOMAIN
  return ''
}

const trackingDomain = resolveTrackingDomain()

const analytics_config_file = {
    // Vue SPA: DSFR must not auto-bind collapses on dynamic sidemenu DOM.
    mode: 'vue',
    // verbose : true,
    analytics: {
        cmp: {
            id: 'tarteaucitron'
        },
        domain: trackingDomain,
        collection: 'manual',
        // Component action tracking needs stable id on each DSFR element; Vue SPA uses manual page pushes instead.
        isActionEnabled: false,
        isDebugging: process.env.NODE_ENV !== 'production',
        page: {
            path: '', // path for page tracking
            referrer: '', // referrer for virtual pages (not for real page, eulerian automatically collects document.referrer)
            id: '', // unique page id (string)
            title: '', // page title for virtual pages
            name: 'accueil', // equivalent to title if not defined
            author: '', // page author name
            date: get_data (),//'03/13/2024', // page creation date
            labels: ['accueil', 'accueil', '', '', ''],
            tags: [], // no tags limit
            template: 'accueil', // page template
            group: 'accueil', // page group. if not defined, fallback to template value
            segment: 'accueil', // site segment. if not defined, fallback to template value
            subtemplate: '', // page subtemplate
            theme: '', // page theme
            subtheme: '', // page subtheme
            related: '', // related page id
            depth: 1, // page depth
            isError: false, // is this an error page (404, 500, 503...)
            current: 0, // In case of pagination, current page number
            total: 0, // In case of pagination, total pages number
            filters: [] // array of filters that were applied on the page (strings)
        },
        user: {
            connect: {
                uid: '', // user id - required when connected
                email: '', // encoded user email - required when connected
                isNew: true, // user just registered
            },
            profile: 'visitor', // user profile
            language: 'fr',
            type: 'pro'
        },
        site: {
            entity: 'Premier Ministre',
            environment: 'preprod',                    
            language: 'fr', // language of the website (ISO 639-1). default to html lang
            target: 'information', // site target
            type: 'standard', // site type
            // region: '', // region of the website (ISO 3166-2:FR)
            // department: '', // department of the website (ISO 3166-2:FR)
            version: '', // version of the website
        },
        search: {
            engine: '',
            results: '',
            terms: '',
            category: '',
            theme: '',
            type: '',
            method: ''
        },
        opt:{
            enable: true
        }
    }
  }
export default analytics_config_file

export function get_data () {    
    var newdate = new Date()
    newdate.setDate( (new Date()).getDate() )    
    return newdate.toISOString().split('T')[0]    
}