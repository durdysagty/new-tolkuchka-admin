//#region imports
import { useEffect, useRef, useState } from 'react'
import config from '../configs/config.json'
import { getData } from '../shared/getData'
import { Accordion, AccordionDetails, AccordionSummary, Box, Button, Checkbox, FormHelperText, Grid, InputLabel, Table, TableBody, TableCell, TableRow, TextField, Typography } from '@mui/material'
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
    const [nestedKeys, setNestedKeys] = useState([])
    const [expanded, setExpanded] = useState(null)
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
            // const query = `${props.api}${props.addapi === undefined ? '' : `/${props.addapi}`}${parentId === undefined ? '' : `/${parentId}`}`
            // selectorKey used in User model
            const result = await getData(props.api, null, props.addapi !== undefined ? { [props.addapi]: parentId } : props.selectorKey !== undefined ? props.selectorKey : null, `search=${search}&page=${page}`)
            if (result.ok) {
                if (result.data.models.length > 0)
                    prepareKeys(Object.keys(result.data.models[0]), props.listKey !== undefined ? Object.keys(result.data.models[0][props.listKey][0]) : null)
                setItems(result.data)
            }
            else if (result.status === 403) {
                setItems(403)
            }
            else
                setError(config.text.wrong)
        }
        function prepareKeys(keys, nestedKeys) {
            const exceptedKeys = ['language', 'deliveryCost', props.listKey]
            const newKeys = keys.filter(k => !exceptedKeys.includes(k))
            setKeys(newKeys)
            if (nestedKeys !== null) {
                if (props.listKey === 'orders')
                    nestedKeys.push('amount')
                setNestedKeys(nestedKeys)
            }
        }
        function expandNested(id) {
            expanded === id ? setExpanded(null) : setExpanded(id)
        }
        function setModels() {
            const modelsList = items === 403 ? <Typography>{config.text.s403}</Typography> : items.models.length === 0 ?
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
                            <TableHeader data={keys.map(k => k === 'isNew' || k === 'isRecommended' || k === 'isForHome' ? config.text[`${k}Short`] : k === 'notInUse' ? config.text['isInUseShort'] : config.text[k])} action={props.api === 'entry' || props.api === undefined || (props.notEditable && !props.watchable && !props.selectable) ? false : true} selectable={props.selectable} />
                            {items.models.map((m, i) => (
                                <TableBody key={i}>
                                    <TableRow sx={{ cursor: props.listKey !== undefined ? 'pointer' : 'initial' }} onClick={props.listKey !== undefined ? () => expandNested(m.id) : undefined} >
                                        {keys.map((k, i) => (<TableCell key={i}>{typeof (m[k]) === 'boolean' ? <Checkbox onChange={props.notEditable ? null : () => changeBoolenProperty(m.id, k)} checked={m[k]} checkedIcon={<CheckBox color='success' />} icon={<Close color='error' />} disabled={k === 'isPaid' || k === 'isDelivered'} /> : k.toLowerCase().includes('date') ? new Date(m[k]).toLocaleString() : !props.noCheckBox && k.includes('rice') && !k.includes('Rate') ? <Box><Checkbox checked={toChanges[k] !== undefined && toChanges[k].includes(String(m.id))} value={m.id} name={k} onChange={e => addToChanges(e)} />{m[k]}</Box> : m[k]}</TableCell>))}
                                        {props.api === 'entry' || props.api === undefined || (props.notEditable && !props.watchable) ? null :
                                            <TableCell>
                                                <EditCell notEditable={props.notEditable} watchable={props.watchable} api={props.api} id={m.id} api2={props.api2} api3={props.api3} parId={parentId} parName={name} name={m.name} delete={() => prepareDelete(m.id)} pro={props.pro} />
                                            </TableCell>
                                        }
                                        {props.selectable ?
                                            <TableCell>
                                                <Checkbox checked={props.selectedIds.includes(m.id)} onChange={e => props.handleCheck(m, e)} value={m.name} />
                                            </TableCell> :
                                            null
                                        }
                                    </TableRow>
                                    {props.listKey !== undefined ?
                                        <TableRow sx={{ visibility: expanded === m.id ? 'visible' : 'collapse' }}>
                                            <TableCell colSpan={props.notEditable ? keys.length : keys.length + 1}>
                                                <Accordion expanded={expanded === m.id}>
                                                    <AccordionSummary></AccordionSummary>
                                                    <AccordionDetails>
                                                        <Table size='small'>
                                                            <TableHeader data={nestedKeys.map(k => config.text[k])} />
                                                            <TableBody>
                                                                {m[props.listKey] !== undefined ? m[props.listKey].map((m, i) => (
                                                                    <TableRow key={i}>
                                                                        {nestedKeys.map((k, i) => (k === 'amount' ?
                                                                            <TableCell key={i}>{m['orderPrice'] * m['quantity']}</TableCell>
                                                                            : <TableCell key={i}>{k.toLowerCase().includes('date') ? new Date(m[k]).toLocaleString() : m[k]}</TableCell>))}
                                                                    </TableRow>)) :
                                                                    null}
                                                                {props.listKey === 'orders' ?
                                                                    <TableRow>
                                                                        <TableCell colSpan={nestedKeys.length - 1} sx={{ textAlign: 'right' }}  >
                                                                            {config.text.deliveryCost}
                                                                        </TableCell>
                                                                        <TableCell>{m['deliveryCost']}</TableCell>
                                                                    </TableRow> :
                                                                    null
                                                                }
                                                            </TableBody>
                                                        </Table>
                                                    </AccordionDetails>
                                                </Accordion>
                                            </TableCell>
                                        </TableRow> :
                                        null
                                    }
                                </TableBody>))}
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
            if (items === null) {
                if (props.list.models.length > 0)
                    prepareKeys(Object.keys(props.list.models[0]), props.listKey !== undefined ? Object.keys(props.list.models[0][props.listKey][0]) : null)
                setItems(props.list)
            }
        }
        if (items !== null) {
            console.log('items')
            setModels()
        }
        // console.log('effect')
    }, [props, keys, nestedKeys, name, items, api, parentId, page, search, toChanges, toSearch, searchTimeOut, expanded])
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
                const response = await fetch(`${process.env.REACT_APP_API_BASE}${process.env.REACT_APP_API}${props.api}/${toDelete}`, {
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
                else if (response.status === 403) {
                    setErrorReason(config.text.sa403)
                }
                else {
                    setErrorReason(config.text.wrong)
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

    const pageHeader = props.list !== undefined ? null : props.selectable ? props.listName !== undefined ? <InputLabel>{props.listName}</InputLabel> : <InputLabel>Список</InputLabel> : <PageHeader models={props.models} name={name} path={props.notAdd ? undefined : `/${props.api}/scr/0${props.addapi === undefined ? '' : `/${parentId}/${name}`}`} />

    return (table === null || (items !== null && api !== props.api) ?
        <Progress /> :
        <Box>
            {props.list !== undefined || items === 403 ? null :
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