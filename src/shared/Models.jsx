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
    const [items, setItems] = useState(null)
    const [table, setTable] = useState(null)
    const [keys, setKeys] = useState(null)
    const [api, setApi] = useState('')
    const [error, setError] = useState(null)
    // const [getShortModels, setGetShortModels] = useState(false)
    //const [lastPage, setLastPage] = useState(null)
    const [page, setPage] = useState(0)
    //const [pagination, setPagination] = useState(null)
    const [change, setChange] = useState('')
    const [toChanges, setToChanges] = useState({})
    const [search, setSearch] = useState('')
    const [toSearch, setToSearch] = useState(false)
    const [searchTimeOut, setSearchTimeOut] = useState(null)
    const modalRef = useRef()
    //#endregion
    useEffect(() => {
        setApi(props.api)
        async function getModels(page, search) {
            console.log('getModels')
            const query = `${props.api}${props.addapi === undefined ? '' : `/${props.addapi}`}${parentId === undefined ? '' : `/${parentId}`}?search=${search}&page=${page}`
            const result = await getData(query)
            if (result.ok) {
                setItems(result.data)
                if (result.data.models.length > 0)
                    prepareKeys(Object.keys(result.data.models[0]))
            }
            else
                setError(config.text.wrong)
        }
        function prepareKeys(keys) {
            const exceptedKeys = ['language', 'deliveryCost']
            const newKeys = keys.filter(k => !exceptedKeys.includes(k))
            setKeys(newKeys)
        }
        function setModels() {
            const modelsList = items.models.length === 0 ?
                <Typography>{config.text.noObject}</Typography> :
                props.api === 'category' ?
                    (<Table size='small'>
                        <TableHeader data={keys.slice(-2).map(k => config.text[k])} action={true} />
                        <TableBody>
                            {items.models.map(a => {
                                return (<TableRow key={a.id}>
                                    <TableCell sx={{ paddingLeft: a.padding, fontSize: 10 / (a.padding / 18 + 0.6) }}>{a.name}</TableCell>
                                    <TableCell >{a.models}</TableCell>
                                    <TableCell>
                                        <EditCell api={props.api} id={a.id} delete={() => prepareDelete(a.id)} pro={props.pro} />
                                    </TableCell>
                                </TableRow>)
                            })}
                        </TableBody>
                    </Table>) :
                    (<Box>
                        <Table size='small'>
                            <TableHeader data={keys.map(k => k === 'isNew' || k === 'isRecommended' ? config.text[`${k}Short`] : k === 'notInUse' ? config.text['isInUseShort'] : config.text[k])} action={props.api === 'entry' || props.api === undefined ? false : true} selectable={props.selectable} />
                            <TableBody>
                                {items.models.map(m => (
                                    <TableRow key={m.id}>
                                        {keys.map((k, i) => (<TableCell key={i}>{typeof (m[k]) === 'boolean' ? <Checkbox onChange={() => changeBoolenProperty(m.id, k)} checked={m[k]} checkedIcon={<CheckBox color='success' />} icon={<Close color='error' />} disabled={k === 'isPaid' || k === 'isDelivered'} /> : k.toLowerCase().includes('date') ? new Date(m[k]).toLocaleString() : k.includes('rice') && !k.includes('Rate') ? <Box><Checkbox checked={toChanges[k] !== undefined && toChanges[k].includes(String(m.id))} value={m.id} name={k} onChange={addToChanges} />{m[k]} </Box> : m[k]}</TableCell>))}
                                        {props.api === 'entry' || props.api === undefined ? null :
                                            <TableCell>
                                                <EditCell api={props.api} id={m.id} api2={props.api2} api3={props.api3} parId={parentId} parName={name} name={m.name} delete={() => prepareDelete(m.id)} pro={props.pro} />
                                            </TableCell>
                                        }
                                        {props.selectable ?
                                            <TableCell>
                                                <Checkbox checked={props.selectedIds.includes(m.id)} onChange={e => props.handleCheck(m, e)} value={m.name} />
                                            </TableCell> :
                                            null
                                        }
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        {items.pagination !== null ?
                            <Box display='flex' alignItems='center' justifyContent='end'>
                                <KeyboardDoubleArrowLeft sx={{ cursor: 'pointer' }} onClick={() => queryPage(0)} />
                                <KeyboardArrowLeft sx={{ cursor: 'pointer' }} onClick={page > 0 ? () => queryPage(page - 1) : null} />
                                <KeyboardArrowRight sx={{ cursor: 'pointer' }} onClick={page < items.lastPage ? () => queryPage(page + 1) : null} />
                                <KeyboardDoubleArrowRight sx={{ cursor: 'pointer' }} onClick={() => queryPage(items.lastPage)} />
                                <Box>
                                    {items.pagination}
                                </Box>
                            </Box> :
                            null
                        }
                    </Box>)
            setTable(modelsList)
        }
        function queryPage(p) {
            if (p !== page) {
                setPage(p)
                getModels(p, search)
            }
        }
        // to change prices of selected models
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
        }
        async function changeBoolenProperty(id, key) {
            const query = `${props.api}${props.addapi === undefined ? '' : `/${props.addapi}`}${parentId === undefined ? '' : `/${parentId}`}/${id}/${key}`
            const result = await getData(query)
            if (result.ok) {
                if (result.data === r.success) {
                    const array = items.models.slice()
                    const model = array.find(m => (m.id === id))
                    model[key] = !model[key]
                    setItems(prevState => ({ ...prevState, models: array }))
                }
                else
                    setErrorReason(config.text.notModified)
            }
            else
                setError(config.text.wrong)
        }
        // if models are to be prepared beforhand
        if (props.list === undefined) {
            if ((items === null && api === props.api) || toSearch) {
                if (toSearch)
                    setToSearch(false)
                getModels(0, search)
            }
            else if (items !== null && api !== props.api) {
                setSearch('')
                getModels(0, '')
            }
        }
        else {
            if (props.list.models.length > 0)
                prepareKeys(Object.keys(props.list.models[0]))
            setItems(props.list)
        }
        if (items !== null) {
            console.log('items')
            setModels()
        }
        // console.log('effect')
    }, [props, keys, name, items, api, parentId, page, search, toChanges, toSearch, searchTimeOut])
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
                    if (result === r.success) {
                        const array = items.models.slice()
                        array.splice(array.indexOf(array.find(a => (a.id === toDelete))), 1)
                        setItems(prevState => ({ ...prevState, models: array }))
                    }
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

    async function submitPrice(e) {
        e.preventDefault()
        const price = parseFloat(change)
        const response = await setFormData(`${props.api}/changeprice`, '0', null, null, {
            price: price.toLocaleString(),
            priceIds: toChanges.price !== undefined ? toChanges.price : null,
            newPriceIds: toChanges.newPrice !== undefined ? toChanges.newPrice : null
        })
        if (response.ok)
            if (response.result === r.success) {
                const array = items.models.slice()
                for (const key in toChanges) {
                    for (const id of toChanges[key]) {
                        const model = array.find(e => e.id === parseInt(id))
                        if (key === 'newPrice' && change === 0)
                            model[key] = ''
                        else
                            model[key] = change
                    }
                }
                setItems(prevState => ({ ...prevState, models: array }))
                setToChanges({})
                setChange(0)
            }
            else
                setError(config.text.wrong)
    }

    function changeSearch(e) {
        setSearch(e.target.value)
        clearTimeout(searchTimeOut)
        const timeOut = setTimeout(() => {
            setToSearch(true)
        }, 1000)
        setSearchTimeOut(timeOut)
    }
    //#endregion

    const pageHeader = props.list !== undefined ? null : props.selectable ? <InputLabel>Список</InputLabel> : <PageHeader models={props.models} name={name} path={props.api === 'invoice' || props.api === 'entry' ? undefined : `/${props.api}/scr/0${props.addapi === undefined ? '' : `/${parentId}/${name}`}`} />

    return (table === null || (items !== null && api !== props.api) ?
        <Progress /> :
        <Box>
            {props.list !== undefined ? null :
                <Grid container justifyContent='space-between' alignItems='center' >
                    <Grid item xs='auto'>
                        {pageHeader}
                    </Grid>
                    {keys?.some(k => k === 'price' || k === 'Price') ?
                        <Grid item xs={3}>
                            <Box component='form' onSubmit={submitPrice} sx={{ display: 'flex' }} >
                                <TextField label={config.text.price} type='number' onKeyDown={(evt) => ["e", "E", "+", "-"].includes(evt.key) && evt.preventDefault()} inputProps={{ step: '0.10' }} onChange={e => setChange(e.target.value)} value={change} />
                                <Box ml={1} pb={1} alignSelf='end'>
                                    <Button type='submit' variant='contained' size='small'>Изменить</Button>
                                </Box>
                            </Box>
                        </Grid> :
                        null}
                    <Grid item xs={4}>
                        <TextField label={config.text.filtersearch} type='text' onChange={changeSearch} value={search} />
                    </Grid>
                </Grid>
            }
            <FormHelperText error>{error}</FormHelperText>
            {table}
            {props.api === 'entry' ? null :
                <RemoveModal ref={modalRef} delete={isDelete => deleteModel(isDelete)} />
            }
        </Box>
    )
}