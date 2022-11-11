import config from '../configs/config.json'

export async function getData(api) {
    try {
        const response = await fetch(`${config.apibase}${config.api}${api}`, {
            method: 'GET',
            credentials: 'include'
        })
        if (response.ok) {
            const result = await response.json()
            return {
                ok: true,
                data: result
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

export async function getEditModel(api, id = '') {
    try {
        const response = await fetch(`${config.apibase}${config.api}${api}/${id}`, {
            method: 'GET',
            credentials: 'include'
        })
        if (response.ok) {
            const result = await response.json()
            return {
                ok: true,
                data: result
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