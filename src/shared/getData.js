// import config from '../configs/config.json'
import { globalLogout } from './globalFunctions'

export async function getData(api, lang = null, optional = null, search = null) {
    let query = ''
    if (optional !== null || search !== null) {
        query = '?'
        if (search !== null)
            query += `${search}&`
        if (optional !== null)
            for (let k in optional)
                query += `keys=${k}&values=${optional[k]}&`
    }
    const response = await fetch(`${lang === null || lang === 'ru' ? process.env.REACT_APP_API_BASE : process.env[`REACT_APP_${lang.toUpperCase()}_API_BASE`]}${process.env.REACT_APP_API}${api}${query}`, {
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
        const response = await fetch(`${process.env.REACT_APP_API_BASE}${process.env.REACT_APP_API}${api}/${id}`, {
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