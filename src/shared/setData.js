import config from '../configs/config.json'

// api - the route
// id - model id, used to determine is model to put or to post, if put - then used for modelId
export async function setFormData(api, id, data, images = null, optional = null) {
    console.log('setFormData')
    try {
        const formData = new FormData()
        if (data !== null) {
            for (let key in data)
                if (data[key] === null)
                    data[key] = ''
            for (let key in data) {
                formData.append(key, data[key])
            }
        }
        if (optional !== null) {
            for (let key in optional)
                if (optional[key] !== null)
                    if (typeof optional[key] === 'string' || typeof optional[key] === 'boolean')
                        formData.append(key, optional[key])
                    else if (optional[key].length === undefined)
                        formData.append(key, optional[key])
                    else
                        for (let o of optional[key]) {
                            if (Array.isArray(o)) {
                                // this option used for datas like IList<int[]> (ModelController POST, PUT)
                                for (let i = 0; i < o.length; i++)
                                    formData.append(`${key}[${optional[key].indexOf(o)}]`, o[i])
                            }
                            else
                                // this option used for simple objects in array like int[] or IList<int> (ProductController POST, PUT)
                                formData.append(key, o)
                        }
        }
        if (images !== null)
            for (let i of images)
                if (i === null)
                    formData.append('images', new File([], '0'))
                else if (i === false)
                    formData.append('images', new File([], 'delete'))
                else
                    formData.append('images', i)
        const response = await fetch(`${config.apibase}${config.api}${api}`, {
            method: id === '0' ? 'POST' : 'PUT',
            credentials: 'include',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem("MIT")
            },
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
                'Authorization': 'Bearer ' + localStorage.getItem("MIT"),
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