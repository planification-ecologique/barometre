export const BASE_URL = process.env.VUE_APP_API_URL

export async function api (url, params = {}) {
    
    //Get_token
    var mytoken = localStorage.getItem("vue-token").replaceAll('"','')
    
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
