const api = 'http://31.220.58.21:8000/api/'

//http://31.220.58.21:8000/api/

function call (method, url, headers, body) {

    return fetch(api + url)

}