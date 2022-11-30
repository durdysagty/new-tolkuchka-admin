import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import config from '../configs/config.json'
import PageHeader from '../shared/PageHeader'
import { Box, Checkbox, FormHelperText, Grid, InputLabel, Table, TableBody, TableCell, TableRow } from '@mui/material'
import TableHeader from '../shared/TableHeader'
import { getData, getEditModel } from '../shared/getData'
import { setFormData } from '../shared/setData'
import { r } from '../shared/Result'
import SubmitButton from '../shared/SubmitButton'
import Progress from '../shared/Progress'

const x = {
    user: '',
    date: ''
}
const keys = Object.keys(x)

export default function InvoiceProcess(props) {
    //#region states
    const { id } = useParams()
    const navigate = useNavigate()
    const [invoice, setInvoice] = useState(x)
    const [invoiceState, setInvoiceState] = useState({
        isDelivered: false,
        isPaid: false
    })
    const [isFilled, setIsFilled] = useState(false)
    const [orders, setOrders] = useState(null)
    const [store, setStore] = useState(null)
    const [once, setOnce] = useState('0')
    const [pairs] = useState([])
    //#endregion
    useEffect(() => {
        if (once !== 1)
            setOnce(1)
        async function prepareData() {
            console.log('prepareData')
            let result = await getEditModel(`${props.api}/currency`, id)
            if (result.ok) {
                result.data.date = new Date(result.data.date).toLocaleString()
                setInvoiceState({
                    isDelivered: result.data.isDelivered,
                    isPaid: result.data.isPaid
                })
                setInvoice(result.data)
            }
            else
                setSubmitError(config.text.wrong)
            result = await getData(`${props.api}/store/${id}`, result.data.language)
            if (result.ok) {
                result.data.forEach(d => {
                    if (d.purchaseId !== null) {
                        const pair = [d.id, d.purchaseId]
                        pairs.push(pair)
                    }
                })
                const isFilled = result.data.every(o => o.purchaseId !== null)
                setIsFilled(isFilled)
                setOrders(result.data)
            }
            else
                setSubmitError(config.text.wrong)
        }
        async function getStore() {
            console.log('getStore')
            const productIds = orders.map(o => o.productId)
            const usedPurchaseIds = orders.filter(o => o.purchaseId !== null).map(o => o.purchaseId)
            // new Set() for get uniq productIds
            let query = Array.from(new Set(productIds)).reduce((acc, curVal) => acc + `ids=${curVal}&`, '?')
            query = usedPurchaseIds.reduce((acc, curVal) => acc + `usedIds=${curVal}&`, query)
            console.log(query)
            const result = await getData(`${props.dataFrom[0]}/store${query}`)
            if (result.ok) {
                // set names of products from orders, thus do not need get them from db again
                const store = result.data.map(s => {
                    const o = orders.find(o => o.productId === s.productId)
                    s.name = o.name
                    return s
                })
                setStore(store)
            }
            else
                setSubmitError(config.text.wrong)
        }
        if (invoice.date === '' && once === 1)
            prepareData()
        if (orders !== null && store == null)
            getStore()
    }, [once, invoice, props.api, props.dataFrom, id, pairs, orders, store, isFilled])

    function setToOrder(id, e) {
        const array = orders.slice()
        if (e.target.checked) {
            const order = array.find(o => o.productId === parseInt(e.target.value) && o.purchaseId === null)
            if (order !== undefined) {
                order.purchaseId = id
                const p = pairs.find(x => x[0] === order.id)
                if (p === undefined) {
                    const pair = [order.id, id]
                    pairs.push(pair)
                }
                else
                    p[1] = id
            }
        }
        else {
            const order = array.find(o => o.purchaseId === id)
            order.purchaseId = null
            const p = pairs.find(x => x[1] === id)
            p[1] = null
        }
        setOrders(array)
        const isFilled = orders.every(o => o.purchaseId !== null)
        setIsFilled(isFilled)
        setInvoiceState({
            isDelivered: isFilled,
            isPaid: isFilled
        })
    }

    function handleChange(e) {
        if (isFilled)
            setInvoiceState(prevState => ({ ...prevState, [e.target.name]: e.target.checked }))
    }

    const [submitError, setSubmitError] = useState('')

    async function submit(e) {
        e.preventDefault()
        // console.log(orders)
        // console.log(invoice)
        const response = await setFormData(`${props.api}/store/${id}`, id, null, null, {
            orderPurchases: pairs,
            isDelivered: invoiceState.isDelivered,
            isPaid: invoiceState.isPaid
        })
        if (response.ok) {
            if (response.result === r.success)
                navigate(-1)
            else
                setSubmitError(config.text.bindedOrder)
        }
        else
            setSubmitError(config.text.wrong)
    }
    return (store === null ?
        <Progress /> :
        <Box>
            <PageHeader id={id} api={props.api} pro='process' name={` #${id}`} />
            <Box margin='auto' >
                <FormHelperText error>{submitError}</FormHelperText>
                <Box my={2}>
                    {keys.map((text, i) => <Grid container key={i} sx={{ display: 'flex' }}>
                        <Grid item xs={5} sm={2} lg={1}>
                            <InputLabel sx={{ color: 'black' }} >{config.text[`${invoice.language}.${text}`]}</InputLabel>
                        </Grid>
                        <InputLabel sx={{ color: 'black' }}><strong>{invoice[text]}</strong></InputLabel>
                    </Grid>)}
                </Box>
                {Object.keys(invoiceState).map((text, i) => (
                    <Grid container key={i} sx={{ display: 'flex' }}>
                        <Grid item xs={5} sm={2} lg={1}>
                            <InputLabel>{config.text[text]}</InputLabel>
                        </Grid>
                        <Checkbox checked={invoiceState[text]} onChange={handleChange} name={text} />
                    </Grid>
                ))}
                <Box>
                    <InputLabel>{config.text.invoiceOrders}</InputLabel>
                    {orders.length > 0 ?
                        <Table size='small'>
                            <TableHeader data={Object.keys(orders[0]).map(k => (config.text[k]))} />
                            <TableBody>
                                {orders.map((o) => <TableRow key={o.id}>
                                    {Object.keys(orders[0]).map((k, i) => <TableCell key={i}>
                                        {o[k]}
                                    </TableCell>)}
                                </TableRow>)}
                            </TableBody>
                        </Table> :
                        null
                    }
                </Box>
                <Box>
                    <InputLabel>{config.text.availablePurchases}</InputLabel>
                    {store.length > 0 ?
                        <Table size='small'>
                            <TableHeader data={Object.keys(store[0]).map(k => (config.text[k]))} action={true} />
                            <TableBody>
                                {store.map((o) => <TableRow key={o.id}>
                                    {Object.keys(store[0]).map((k, i) => <TableCell key={i}>
                                        {o[k]}
                                    </TableCell>)}
                                    <TableCell>
                                        <Checkbox checked={pairs.some(p => p[1] === o.id)} value={o.productId} onChange={e => setToOrder(o.id, e)} />
                                    </TableCell>
                                </TableRow>)}
                            </TableBody>
                        </Table> :
                        null
                    }
                </Box>
                <Box component='form' onSubmit={submit} margin='auto' >
                    <SubmitButton id={id} />
                </Box>
            </Box>
        </Box >
    )
}