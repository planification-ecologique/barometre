export const BASE_URL = process.env.VUE_APP_API_URL

export async function api (url, params = {}) {
    
    try {
        //Get_token
        var mytoken = localStorage.getItem("vue-token").replaceAll('"','')
    } catch (error) {
        console.error('Error getting token: ', error)
    }
    
    
    params = Object.assign({
        mode: 'cors',
        cache: 'no-cache',
    }, params)

    params.headers = Object.assign({
        Authorization: 'Bearer ' + mytoken,
        'Content-Type': 'application/json'
    }, params.headers)

    let response = await fetch(BASE_URL + url, params)
    let json = await response.json() || {}
    if (!response.ok){
        let errorMessage = json.error || response.status
        throw new Error(errorMessage)
    }
    // else {console.log(json)}
    
    return json
}
