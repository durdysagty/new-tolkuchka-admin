import config from '../configs/config.json'
import { globalLogout } from './globalFunctions'

export async function getData(api, lang = null, optional = null) {
    let query = ''
    if (optional !== null) {
        query = '?'
        for (let k in optional)
            query += `keys=${k}&values=${optional[k]}&`
    }
    const response = await fetch(`${lang === null || lang === 'ru' ? config.apibase : config[`${lang}.apibase`]}${config.api}${api}${query}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem("MIT")
        }
    })
    if (response.ok) {
        const result = await response.json()
        return {
            ok: true,
            data: result
        }
    }
    else if (response.status === 401) {
        globalLogout()
        window.location.href = '/'
    }
    else if (response.status === 403) {
        return {
            status: 403
        }
    }
    else {
        return {
            ok: false
        }
    }
}

export async function getEditModel(api, id = '') {
    try {
        const response = await fetch(`${config.apibase}${config.api}${api}/${id}`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem("MIT")
            }
        })
        if (response.ok) {
            const result = await response.json()
            return {
                ok: true,
                data: result
            }
        }
        else if (response.status === 401) {
            globalLogout()
            window.location.href = '/'
        }
        else if (response.status === 403) {
            return {
                status: 403
            }
        }
        else {
            return {
                ok: false
            }
        }
    }
    catch {
        return {
            ok: false
        }
    }
}