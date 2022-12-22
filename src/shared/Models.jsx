//#region imports
import { useEffect, useRef, useState } from 'react'
import config from '../configs/config.json'
import { getData } from '../shared/getData'
import { Box, Button, Checkbox, FormHelperText, Grid, InputLabel, Table, TableBody, TableCell, TableRow, TextField, Typography } from '@mui/material'
import EditCell from './EditCell'
import TableHeader from './TableHeader'
import PageHeader from './PageHeader'
import { RemoveModal } from './RemoveModal'
import Progress from './Progress'
import { useParams } from 'react-router-dom'
import { r } from './Result'
import { CheckBox, Close, KeyboardArrowLeft, KeyboardArrowRight, KeyboardDoubleArrowLeft, KeyboardDoubleArrowRight } from '@mui/icons-material'
import { setFormData } from './setData'
//#endregion
export default function Models(props) {

    //#region states
    const { parentId } = useParams()
    const { name } = useParams()
    const [models, setModels] = useState(null)
    const [keys, setKeys] = useState(null)
    const [api, setApi] = useState('')
    const [error, setError] = useState(null)
    const [getShortModels, setGetShortModels] = useState(false)
    const [lastPage, setLastPage] = useState(null)
    const [page, setPage] = useState(0)
    const [pagination, setPagination] = useState(null)
    const [change, setChange] = useState(0)
    const [toChanges, setToChanges] = useState({})
    const modalRef = useRef()
    //#endregion
    useEffect(() => {
        setApi(props.api)
        // if models are to be prepared beforhand
        if (props.list === undefined) {
            const query = `${props.api}${props.addapi === undefined ? '' : `/${props.addapi}`}${parentId === undefined ? '' : `/${parentId}`}`
            async function getModels() {
                console.log('getModels')
                const result = await getData(query)
                if (result.ok) {
                    setLastPage(result.data.lastPage)
                    setPagination(result.data.pagination)
                    setModels(result.data.models)
                    if (result.data.models.length > 0)
                        prepareKeys(Object.keys(result.data.models[0]))
                }
                else
                    setError(config.text.wrong)
            }
            if (models === null && api === props.api)
                getModels()
            else if (models !== null && api !== props.api) {
                getModels()
            }
            if (getShortModels)
                getModelsShort()
        }
        else {
            if (props.list.length > 0)
                prepareKeys(Object.keys(props.list[0]))
            setModels(props.list)
        }
        function prepareKeys(keys) {
            const exceptedKeys = ['language', 'deliveryCost']
            const newKeys = keys.filter(k => !exceptedKeys.includes(k))
            setKeys(newKeys)
        }
        async function getModelsShort() {
            console.log('getModelsShort')
            setGetShortModels(false)
            let query = `${props.api}${props.addapi === undefined ? '' : `/${props.addapi}`}${parentId === undefined ? '' : `/${parentId}`}?`
            query += `page=${page}`
            const result = await getData(query)
            if (result.ok) {
                if (result.data.models === undefined)
                    setModels(result.data)
                else {
                    setModels(result.data.models)
                    setLastPage(result.data.lastPage)
                    setPagination(result.data.pagination)
                }
            }
            else
                setError(config.text.wrong)
        }
        // console.log('effect')
    }, [props.list, models, api, props.api, props.addapi, parentId, getShortModels, page])
    // #region functions
    const [toDelete, setToDelete] = useState(null)

    function prepareDelete(id) {
        setToDelete(id)
        modalRef.current.handleOpen()
    }

    function setErrorReason(text) {
        setError(text)
        setTimeout(() => {
            setError(null)
        }, 5000)
    }

    async function deleteModel(isDelete) {
        if (isDelete)
            try {
                const response = await fetch(`${config.apibase}${config.api}${props.api}/${toDelete}`, {
                    method: 'DELETE',
                    credentials: 'include',
                    headers: {
                        'Authorization': 'Bearer ' + localStorage.getItem("MIT")
                    }
                })
                if (response.ok) {
                    const result = await response.json()
                    if (result === r.success)
                        models.splice(models.indexOf(models.find(a => (a.id === toDelete))), 1)
                    else
                        setErrorReason(config.text.notDeleted)
                    setToDelete(null)
                }
                else {
                    setError(config.text.wrong)
                }
            }
            catch {
                setError(config.text.wrong)
            }
        else
            setToDelete(null)
        modalRef.current.handleClose()
    }

    function queryPage(p) {
        if (p !== page)
            setPage(p)
        setGetShortModels(true)
    }

    async function changeBoolenProperty(id, key) {
        const query = `${props.api}${props.addapi === undefined ? '' : `/${props.addapi}`}${parentId === undefined ? '' : `/${parentId}`}/${id}/${key}`
        const result = await getData(query)
        if (result.ok) {
            if (result.data === r.success) {
                const array = models.slice()
                const model = array.find(m => (m.id === id))
                model[key] = !model[key]
                setModels(array)
            }
            else
                setErrorReason(config.text.notModified)
        }
        else
            setError(config.text.wrong)
    }

    function addToChanges(e) {
        let ids = toChanges[e.target.name]
        if (ids === undefined)
            ids = []
        if (e.target.checked)
            ids.push(e.target.value)
        else
            ids.splice(ids.indexOf(e.target.value), 1)
        if (ids.length === 0)
            delete toChanges[e.target.name]
        else
            setToChanges(prevState => ({ ...prevState, [e.target.name]: ids }))
        console.log(toChanges)
    }
    //#endregion
    async function submitPrice(e) {
        e.preventDefault()
        const price = parseFloat(change)
        const response = await setFormData(`${props.api}/changeprice`, '0', null, null, {
            price: price,
            priceIds: toChanges.price !== undefined ? toChanges.price : null,
            newPriceIds: toChanges.newPrice !== undefined ? toChanges.newPrice : null
        })
        if (response.ok)
            if (response.result === r.success) {
                for (const key in toChanges) {
                    for (const id of toChanges[key]) {
                        const model = models.find(e => e.id === parseInt(id))
                        if (key === 'newPrice' && change === 0)
                            model[key] = ''
                        else
                            model[key] = change
                    }
                }
                setToChanges({})
                setChange(0)
            }
            else
                setError(config.text.wrong)
    }

    const pageHeader = props.list !== undefined ? null : props.selectable ? <InputLabel>Список</InputLabel> : <PageHeader models={props.models} name={name} path={props.api === 'invoice' || props.api === 'entry' ? undefined : `/${props.api}/scr/0${props.addapi === undefined ? '' : `/${parentId}/${name}`}`} />

    return (models === null ?
        <Progress /> :
        <Box>
            {props.list !== undefined ? null :
                <Grid container justifyContent='space-between' >
                    <Grid item xs='auto'>
                        {pageHeader}
                    </Grid>
                    {keys.some(k => k === 'price' || k === 'Price') ?
                        <Grid item xs='auto'>
                            <Box component='form' onSubmit={submitPrice} margin='auto' sx={{ display: 'inline-flex' }} >
                                <TextField type='number' onKeyDown={(evt) => ["e", "E", "+", "-"].includes(evt.key) && evt.preventDefault()} inputProps={{ step: '0.10' }} onChange={e => setChange(e.target.value)} value={change} />
                                <Box ml={1}>
                                    <Button type='submit' variant='contained' size='small'>Изменить</Button>
                                </Box>
                            </Box>
                        </Grid> :
                        null}
                </Grid>
            }
            <FormHelperText error>{error}</FormHelperText>
            {models.length === 0 ?
                <Typography>{config.text.noObject}</Typography> :
                props.api === 'category' ?
                    <Table size='small'>
                        <TableHeader data={keys.slice(-2).map(k => config.text[k])} action={true} />
                        <TableBody>
                            {models.map(a => {
                                return (<TableRow key={a.id}>
                                    <TableCell sx={{ paddingLeft: a.padding, fontSize: 10 / (a.padding / 18 + 0.6) }}>{a.name}</TableCell>
                                    <TableCell >{a.models}</TableCell>
                                    <TableCell>
                                        <EditCell api={props.api} id={a.id} delete={() => prepareDelete(a.id)} pro={props.pro} />
                                    </TableCell>
                                </TableRow>)
                            })}
                        </TableBody>
                    </Table> :
                    <Table size='small'>
                        <TableHeader data={keys.map(k => k === 'isNew' || k === 'isRecommended' ? config.text[`${k}Short`] : k === 'notInUse' ? config.text['isInUseShort'] : config.text[k])} action={props.api === 'entry' || props.api === undefined ? false : true} />
                        <TableBody>
                            {models.map(m => (
                                <TableRow key={m.id}>
                                    {keys.map((k, i) => (<TableCell key={i}>{typeof (m[k]) === 'boolean' ? <Checkbox onChange={() => changeBoolenProperty(m.id, k)} checked={m[k]} checkedIcon={<CheckBox color='success' />} icon={<Close color='error' />} disabled={k === 'isPaid' || k === 'isDelivered'} /> : k.toLowerCase().includes('date') ? new Date(m[k]).toLocaleString() : k.includes('rice') && !k.includes('Rate') ? <Box><Checkbox checked={toChanges[k] !== undefined && toChanges[k].includes(String(m.id))} value={m.id} name={k} onChange={addToChanges} />{m[k]} </Box> : m[k]}</TableCell>))}
                                    {props.api === 'entry' || props.api === undefined ? null :
                                        <TableCell>
                                            {props.selectable ?
                                                <Checkbox checked={props.selectedIds.includes(m.id)} onChange={e => props.handleCheck(m, e)} value={m.name} /> :
                                                <EditCell api={props.api} id={m.id} api2={props.api2} api3={props.api3} parId={parentId} parName={name} name={m.name} delete={() => prepareDelete(m.id)} pro={props.pro} />
                                            }
                                        </TableCell>
                                    }
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
            }
            {pagination !== null ? <Box display='flex' alignItems='center' justifyContent='end'>
                <KeyboardDoubleArrowLeft onClick={() => queryPage(0)} />
                <KeyboardArrowLeft onClick={page > 0 ? () => queryPage(page - 1) : null} />
                <KeyboardArrowRight onClick={page < lastPage ? () => queryPage(page + 1) : null} />
                <KeyboardDoubleArrowRight onClick={() => queryPage(lastPage)} />
                <Box>
                    {pagination}
                </Box>
            </Box>
                : null}
            {props.api === 'entry' ? null :
                <RemoveModal ref={modalRef} delete={isDelete => deleteModel(isDelete)} />
            }
        </Box>
    )
}