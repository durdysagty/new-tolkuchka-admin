import { useEffect, useRef, useState } from 'react'
import config from '../configs/config.json'
import { getData } from '../shared/getData'
import { Box, Checkbox, FormHelperText, Grid, IconButton, InputLabel, SwipeableDrawer, Table, TableBody, TableCell, TableRow, Typography } from '@mui/material'
import EditCell from './EditCell'
import TableHeader from './TableHeader'
import PageHeader from './PageHeader'
import { RemoveModal } from './RemoveModal'
import Progress from './Progress'
import { useParams } from 'react-router-dom'
import { r } from './Result'
import { CheckBox, Close, FilterAlt, KeyboardArrowLeft, KeyboardArrowRight, KeyboardDoubleArrowLeft, KeyboardDoubleArrowRight } from '@mui/icons-material'

export default function Models(props) {

    const { parentId } = useParams()
    const { name } = useParams()
    const [models, setModels] = useState(null)
    const [keys, setKeys] = useState(null)
    const [api, setApi] = useState('')
    const [error, setError] = useState(null)
    const [drawer, setDrawer] = useState(false)
    const [drawerOpen, setDrawerOpen] = useState(false)
    const [filters, setFilters] = useState(null)
    const [selectedFilters, setSelectedFilters] = useState({})
    const [lastPage, setLastPage] = useState(null)
    const [page, setPage] = useState(0)
    const [pagination, setPagination] = useState(null)
    const modalRef = useRef()

    useEffect(() => {
        setApi(props.api)
        // if models are to be prepared beforhand
        if (props.list === undefined) {
            const query = `${props.api}${props.addapi === undefined ? '' : `/${props.addapi}`}${parentId === undefined ? '' : `/${parentId}`}`
            async function getModels() {
                console.log('getModels')
                const result = await getData(query)
                if (result.ok) {
                    if (result.data.filters === undefined) {
                        setModels(result.data)
                        if (result.data.length > 0)
                            prepareKeys(Object.keys(result.data[0]))
                        setDrawer(false)
                        setFilters(null)
                        setSelectedFilters({})
                        setPage(0)
                        setLastPage(null)
                        setPagination(null)
                    }
                    else {
                        setModels(result.data.models)
                        if (result.data.models.length > 0)
                            prepareKeys(Object.keys(result.data.models[0]))
                        const fs = {}
                        result.data.filters.forEach(async (f) => {
                            if (!f.includes(" ")) {
                                const result = await getData(`${f}`)
                                if (result.ok) {
                                    fs[f] = result.data
                                    selectedFilters[f] = []
                                }
                                else
                                    setError(config.text.wrong)
                            }
                            else {
                                fs[f] = []
                                selectedFilters[f.split(" ")[1]] = []
                            }
                        })
                        setLastPage(result.data.lastPage)
                        setPagination(result.data.pagination)
                        setFilters(fs)
                        setDrawer(true)
                    }
                }
                else
                    setError(config.text.wrong)
            }
            if (models === null && api === props.api)
                getModels()
            else if (models !== null && api !== props.api) {
                getModels()
            }
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
        // console.log('effect')
        // console.log(models)
    }, [props.list, models, api, props.api, props.addapi, parentId, filters, selectedFilters])
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

    async function getModelsShort(page) {
        console.log('getModelsShort')
        setPage(page)
        let query = `${props.api}${props.addapi === undefined ? '' : `/${props.addapi}`}${parentId === undefined ? '' : `/${parentId}`}?`
        for (let key in selectedFilters) {
            for (let i = 0; i < selectedFilters[key].length; i++)
                query += `${key}=${selectedFilters[key][i]}&`
        }
        query += `page=${page}`
        const result = await getData(query)
        if (result.ok) {
            if (result.data.filters === undefined)
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
    // get filters that depends on parent
    async function getDependentFilterData(key) {
        console.log('getFilterShort')
        const apis = key.split(" ")
        // get key of dependence selectedFilter
        const filterKey = apis[0].replace('Id', '')
        if (selectedFilters[filterKey].length > 0) {
            let query = `${apis[1]}?`
            for (let i = 0; i < selectedFilters[filterKey].length; i++)
                query += `${apis[0]}=${selectedFilters[filterKey][i]}&`
            const result = await getData(query)
            if (result.ok) {
                if (result.data.filters === undefined)
                    filters[key] = result.data
                else
                    filters[key] = result.data.models
            }
            else
                setError(config.text.wrong)
        }
        else
            filters[key] = []
    }

    function querySet(e, key, dependent) {
        if (dependent) {
            if (e.target.checked)
                selectedFilters[key][0] = e.target.value
            else {
                selectedFilters[key].splice(selectedFilters[key].indexOf(e.target.value), 1)
            }
        }
        else {
            if (e.target.checked)
                selectedFilters[key].push(e.target.value)
            else {
                selectedFilters[key].splice(selectedFilters[key].indexOf(e.target.value), 1)
            }
        }
        getModelsShort(0)
        const keys = Object.keys(filters)
        const dependentFilterKey = keys.find(k => {
            return k.includes(`${key}Id`)
        })
        if (dependentFilterKey !== undefined)
            getDependentFilterData(dependentFilterKey)
    }

    function queryPage(p) {
        if (p !== page) {
            getModelsShort(p)
        }
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
    //#endregion

    const pageHeader = props.list !== undefined ? null : props.selectable ? <InputLabel>Список</InputLabel> : <PageHeader models={props.models} name={name} path={props.api === 'invoice' || props.api === 'entry' ? undefined : `/${props.api}/scr/0${props.addapi === undefined ? '' : `/${parentId}/${name}`}`} />

    return (models === null ?
        <Progress /> :
        <Box>
            {props.list !== undefined ? null : drawer ?
                <Grid container>
                    <Grid item xs={11}>
                        {pageHeader}
                    </Grid>
                    <Grid item xs={1}>
                        <IconButton onClick={() => setDrawerOpen(true)}>
                            <FilterAlt />
                        </IconButton>
                    </Grid>
                </Grid> :
                pageHeader
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
                                    <TableCell >{a.products}</TableCell>
                                    <TableCell>
                                        <EditCell api={props.api} id={a.id} delete={() => prepareDelete(a.id)} pro={props.pro} />
                                    </TableCell>
                                </TableRow>)
                            })}
                        </TableBody>
                    </Table> :
                    <Table size='small'>
                        <TableHeader data={keys.map(k => k.includes('is') ? config.text[`${k}Short`] : k === 'notInUse' ? config.text['isInUseShort'] : config.text[k])} action={props.api === 'entry' || props.api === undefined ? false : true} />
                        <TableBody>
                            {models.map(m => (
                                <TableRow key={m.id}>
                                    {keys.map((k, i) => (<TableCell key={i}>{typeof (m[k]) === 'boolean' ? <Checkbox onChange={() => changeBoolenProperty(m.id, k)} checked={m[k]} checkedIcon={<CheckBox color='success' />} icon={<Close color='error' />} /> : k.toLowerCase().includes('date') ? new Date(m[k]).toLocaleString() : m[k]}</TableCell>))}
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
            {drawer ? <SwipeableDrawer anchor='right' open={drawerOpen} onOpen={() => setDrawerOpen(true)} onClose={() => setDrawerOpen(false)}>
                <Box sx={{ width: 370 }} mt={8} px={2}>
                    {filters !== null ? Object.keys(filters).sort((a, b) => {
                        let x = a.includes(" ") ? 1 : 0
                        let y = b.includes(" ") ? 1 : 0
                        if (x < y) { return -1 }
                        else if (x > y) { return 1 }
                        else if (x === 0 && y === 0) {
                            x = a.toLowerCase();
                            y = b.toLowerCase();
                            if (x < y) { return 1; }
                            if (x > y) { return -1; }
                        }
                        return 0
                    }).map(f => {
                        const dependent = f.includes(" ")
                        const key = dependent ? f.split(" ")[1] : f
                        return <Box key={f} mt={2} maxHeight={350} sx={{ overflowY: 'scroll' }}>
                            <strong>{config.text[key]}</strong>
                            <Box p={1}>
                                {filters[f].map(d => (<Box sx={{ paddingLeft: d.padding }} key={d.id}>
                                    <Checkbox checked={selectedFilters[key].includes(`${d.id}`)} onChange={e => querySet(e, key, dependent)} value={d.id} />
                                    {d.name}
                                </Box>))}
                            </Box>
                        </Box>
                    }) : null}
                </Box>
            </SwipeableDrawer> : null}
        </Box>
    )
}