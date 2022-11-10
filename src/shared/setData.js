import config from '../configs/config.json'

export async function setFormData(api, id, data, images = null, optional = null) {
    console.log('setFormData')
    try {
        for (let key in data)
            if (data[key] === null)
                data[key] = ''
        const formData = new FormData()
        for (let key in data) {
            formData.append(key, data[key])
        }
        if (optional !== null) {
            for (let key in optional) {
                if (optional[key] !== null)
                    for (let o of optional[key]) {
                        if (Array.isArray(o)) {
                            for (let i = 0; i < o.length; i++)
                                formData.append(`${key}[${optional[key].indexOf(o)}]`, o[i])
                        }
                        else
                            formData.append(key, o)
                    }
            }
        }
        if (images !== null)
            for (let i of images)
                if (i === null)
                    formData.append('images', new File([], '0'))
                else
                    formData.append('images', i)
        const response = await fetch(`${config.apibase}${config.api}${api}`, {
            method: id === '0' ? 'POST' : 'PUT',
            credentials: 'include',
            body: formData
        })
        if (response.ok) {
            const result = await response.json()
            return {
                ok: true,
                result: result
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

export async function setJsonData(api, id, data) {
    console.log('setJsonData')
    for (let key in data)
        if (data[key] === '')
            data[key] = null
    try {
        const response = await fetch(`${config.apibase}${config.api}${api}`, {
            method: id === '0' ? 'POST' : 'PUT',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        if (response.ok) {
            const result = await response.json()
            return {
                ok: true,
                result: result
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