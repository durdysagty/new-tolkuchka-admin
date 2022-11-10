import { useEffect, useRef, useState } from 'react'
import config from '../configs/config.json'
import { getData } from '../shared/getData'
import { Box, Checkbox, FormHelperText, Grid, IconButton, SwipeableDrawer, Table, TableBody, TableCell, TableRow, Typography } from '@mui/material'
import EditCell from './EditCell'
import TableHead from './TableHeader'
import PageHeader from './PageHeader'
import { RemoveModal } from './RemoveModal'
import Progress from './Progress'
import { useParams } from 'react-router-dom'
import { r } from './Result'
import { Check, Close, FilterAlt, KeyboardArrowLeft, KeyboardArrowRight, KeyboardDoubleArrowLeft, KeyboardDoubleArrowRight } from '@mui/icons-material'

export default function Models(props) {

    const { id } = useParams()
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
        const query = `${props.api}${props.addapi === undefined ? '' : `/${props.addapi}`}${id === undefined ? '' : `/${id}`}`
        async function getModels() {
            console.log('getModels')
            const result = await getData(query)
            if (result.ok) {
                if (result.data.filters === undefined) {
                    setModels(result.data)
                    if (result.data.length > 0)
                        setKeys(Object.keys(result.data[0]))
                    setDrawer(false)
                }
                else {
                    setModels(result.data.models)
                    if (result.data.models.length > 0)
                        setKeys(Object.keys(result.data.models[0]))
                    const fs = {}
                    result.data.filters.forEach(async (f) => {
                        const result = await getData(`${f}`)
                        if (result.ok) {
                            fs[f] = result.data
                            selectedFilters[f] = []
                        }
                        else
                            setError(config.text.wrong)
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
            setSelectedFilters({})
            setPage(0)
            setLastPage(null)
            setPagination(null)
            getModels()
        }
        console.log('effect')
    }, [models, api, props.api, props.addapi, id, filters, selectedFilters])

    const [toDelete, setToDelete] = useState(null)

    function prepareDelete(id) {
        setToDelete(id)
        modalRef.current.handleOpen()
    }

    async function deleteModel(isDelete) {
        if (isDelete)
            try {
                const response = await fetch(`${config.apibase}${config.api}${props.api}/${toDelete}`, {
                    method: 'DELETE',
                    credentials: 'include'
                })
                if (response.ok) {
                    const result = await response.json()
                    if (result === r.success)
                        models.splice(models.indexOf(models.find(a => (a.id === toDelete))), 1)
                    else {
                        setError(config.text.notDeleted)
                        setTimeout(() => {
                            setError(null)
                        }, 5000)
                    }
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
        console.log(selectedFilters)
        let query = `${props.api}${props.addapi === undefined ? '' : `/${props.addapi}`}${id === undefined ? '' : `/${id}`}?`
        for (let key in selectedFilters) {
            for (let i = 0; i < selectedFilters[key].length; i++)
                query += `${key}=${selectedFilters[key][i]}&`
        }
        query += `page=${page}`
        console.log(query)
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

    function querySet(e, key) {
        // const sf = Object.assign({}, selectedFilters)
        if (e.target.checked)
            selectedFilters[key].push(e.target.value)
        else {
            selectedFilters[key].splice(selectedFilters[key].indexOf(e.target.value), 1)
        }
        getModelsShort(0)
    }

    function queryPage(p) {
        if (p !== page) {
            getModelsShort(p)
        }
    }

    return (models === null ?
        <Progress /> :
        <Box>
            {drawer ?
                <Grid container>
                    <Grid item xs={11}>
                        <PageHeader models={props.models} name={name} path={`/${props.api}/scr/0${props.addapi === undefined ? '' : `/${id}/${name}`}`} />
                    </Grid>
                    <Grid item xs={1}>
                        <IconButton onClick={() => setDrawerOpen(true)}>
                            <FilterAlt />
                        </IconButton>
                    </Grid>
                </Grid> :
                <PageHeader models={props.models} name={name} path={`/${props.api}/scr/0${props.addapi === undefined ? '' : `/${id}/${name}`}`} />
            }
            <FormHelperText error>{error}</FormHelperText>
            {models.length === 0 ?
                <Typography>{config.text.noObject}</Typography> :
                props.api === 'category' ?
                    <Table size='small'>
                        <TableHead data={keys.slice(-2)} />
                        <TableBody>
                            {models.map(a => {
                                const padding = a.padding
                                return (<TableRow key={a.id}>
                                    <TableCell sx={{ paddingLeft: padding }}>{a.name}</TableCell>
                                    <TableCell >{a.products}</TableCell>
                                    <TableCell>
                                        <EditCell api={props.api} id={a.id} delete={() => prepareDelete(a.id)} pro={props.pro} />
                                    </TableCell>
                                </TableRow>)
                            })}
                        </TableBody>
                    </Table> :
                    <Table size='small'>
                        <TableHead data={keys} />
                        <TableBody>
                            {models.map(a => (
                                <TableRow key={a.id}>
                                    {keys.map((k, i) => (<TableCell key={i}>{typeof (a[k]) === 'boolean' ? a[k] ? <Check color='success' /> : <Close color='error' /> : a[k]}</TableCell>
                                    ))}
                                    <TableCell>
                                        <EditCell api={props.api} id={a.id} api2={props.api2} parId={id} parName={name} name={a.name} delete={() => prepareDelete(a.id)} pro={props.pro} />
                                    </TableCell>
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
            <RemoveModal ref={modalRef} delete={isDelete => deleteModel(isDelete)} />
            {drawer ? <SwipeableDrawer anchor='right' open={drawerOpen} onOpen={() => setDrawerOpen(true)} onClose={() => setDrawerOpen(false)}>
                <Box sx={{ width: 370 }} mt={8} px={2}>
                    {filters !== null ? Object.keys(filters).map(f => {
                        return <Box key={f} mt={2} maxHeight={350} sx={{ overflowY: 'scroll' }}>
                            <strong>{config.text[f]}</strong>
                            <Box p={1}>
                                {filters[f].map(d => (<Box sx={{ paddingLeft: d.padding }} key={d.id}>
                                    <Checkbox checked={selectedFilters[f].includes(`${d.id}`)} onChange={e => querySet(e, f)} value={d.id} />
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