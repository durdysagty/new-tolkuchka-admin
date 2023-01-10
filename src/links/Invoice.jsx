import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import config from '../configs/config.json'
import PageHeader from '../shared/PageHeader'
import { Box, FormHelperText, InputLabel, Table, TableBody, TableCell, TableRow, TextField } from '@mui/material'
import TableHeader from '../shared/TableHeader'
import { getData, getEditModel } from '../shared/getData'
import { setFormData } from '../shared/setData'
import { r } from '../shared/Result'
import SubmitButton from '../shared/SubmitButton'
import Progress from '../shared/Progress'
import AccordionList from '../shared/AccordionList'
import Models from '../shared/Models'
import { Delete } from '@mui/icons-material'
import { wait } from '@testing-library/user-event/dist/utils'

const x = {
    invoiceAddress: '',
    invoicePhone: '',
    deliveryCost: '',
    currencyId: '',
}
const keys = Object.keys(x)
const orderKeys = ['productId', 'name', 'orderPrice', 'quantity']

export default function Invoice(props) {
    //#region states
    const { id } = useParams()
    const navigate = useNavigate()
    const [invoice, setInvoice] = useState(x)
    const [validation, setValidation] = useState(x)
    const [error, setError] = useState(false)
    const [currencies, setCurrencies] = useState(null)
    const [orders, setOrders] = useState([])
    const [once, setOnce] = useState('0')
    const [process, setProcess] = useState(false)
    //#endregion
    useEffect(() => {
        if (once !== 1)
            setOnce(1)
        async function prepareData() {
            console.log('prepareData')
            let result = await getData(props.dataFrom[0])
            if (result.ok)
                setCurrencies(result.data.models.map(c => ({
                    id: c.id,
                    name: c.codeName,
                    realRate: c.realRate,
                    priceRate: c.priceRate
                })))
            else
                setSubmitError(config.text.wrong)
            if (id !== '0') {
                result = await getData(`${props.api}/orders/${id}`)
                if (result.ok) {
                    result.data.forEach(p => p.orderPrice = parseFloat(p.orderPrice))
                    setOrders(result.data)
                }
                else
                    setError(config.text.wrong)
                result = await getEditModel(props.api, id)
                if (result.ok) {
                    result.data.currencyRate = result.data.currencyRate.toLocaleString()
                    setInvoice(result.data)
                }
                else
                    setSubmitError(config.text.wrong)
            }
        }
        if (currencies === null && once === 1)
            prepareData()
    }, [once, props.api, props.dataFrom, id, currencies, orders, process])
    // #region functions
    function handleChange(e) {
        setInvoice(prevState => ({ ...prevState, [e.target.name]: e.target.value }))
        setValidation(prevState => ({
            ...prevState,
            [e.target.name]: ''
        }))
        if (e.target.name === 'currencyId') {
            // console.log(orders)
            const currencyNew = currencies.find(c => c.id === parseInt(e.target.value))
            const currencyOld = currencies.find(c => c.id === parseInt(invoice.currencyId))
            const array = orders.slice()
            array.forEach(a => {
                a.orderPrice = a.orderPrice / currencyOld.priceRate * currencyNew.priceRate
            })
            setOrders(array)
            setInvoice(prevState => ({ ...prevState, currencyRate: currencyNew.realRate }))
        }
        console.log(invoice)
    }
    function invalid(e) {
        e.preventDefault()
        setValidation(prevState => ({
            ...prevState,
            [e.target.name]: config.text.empty
        }))
        setError(true)
    }

    function handleOrder(o, e) {
        const array = orders.slice()
        if (e !== undefined && e.target.checked) {
            const currency = currencies.find(c => c.id === parseInt(invoice.currencyId))
            const order = {
                productId: o.id,
                name: e.target.value,
                orderPrice: parseFloat(parseFloat(currency.priceRate) * (o.newPrice === null ? o.price : o.newPrice)),
                quantity: 1
            }
            array.push(order)
        }
        else {
            array.splice(array.indexOf(array.find(a => a.productId === o.productId)), 1)
        }
        setOrders(array)
    }

    function handleOrderPrice(id, e) {
        if (e.target.value > 0) {
            const array = orders.slice()
            const o = array.find(p => p.productId === id)
            o.orderPrice = parseFloat(e.target.value)
            setOrders(array)
        }
    }

    function handleOrderQuantity(id, e) {
        if (e.target.value > 0) {
            const array = orders.slice()
            const p = array.find(p => p.productId === id)
            p.quantity = parseInt(e.target.value)
            setOrders(array)
        }
    }

    const [submitError, setSubmitError] = useState('')

    const { pro } = useParams()
    //#endregion
    async function submit(e) {
        e.preventDefault()
        setProcess(true)
        await wait(0)
        // console.log(orders)
        // console.log(invoice)
        if (orders.length < 1) {
            setSubmitError(config.text.noPurchase)
            return
        }
        let i = id
        if (pro === 'sim')
            i = '0'
        if (invoice.deliveryCost !== '') {
            let value = parseFloat(invoice.deliveryCost)
            invoice.deliveryCost = value.toLocaleString()
        }
        const response = await setFormData(props.api, i, invoice, null, {
            jsonOrders: JSON.stringify(orders)
        })
        if (response.ok) {
            if (response.result === r.success)
                navigate(-1)
            else
                setSubmitError(config.text.bindedOrder)
        }
        else
            setSubmitError(config.text.wrong)
        setProcess(false)
    }
    // const list = currencies.map(c => ({ id: c.id, name: c.codeName }))
    return ((id !== '0' && invoice.currencyId === '') || currencies === null || process ?
        <Progress /> :
        <Box>
            <PageHeader id={id} pro={pro} api={props.api} />
            <Box component='form' onSubmit={submit} onInvalid={invalid} margin='auto' mb={1} >
                <FormHelperText error>{submitError}</FormHelperText>
                <TextField type='text' label={config.text[keys[0]]} name={keys[0]} onChange={handleChange} value={invoice[keys[0]]} required helperText={error ? validation[keys[0]] : ''} error={error && validation[keys[0]] !== '' ? true : false} />
                <TextField type='number' onKeyDown={(evt) => config.phoneOnly.includes(evt.key) && evt.preventDefault()} label={config.text.invoicePhone} name={keys[1]} onChange={handleChange} value={invoice[keys[1]]} required helperText={error ? validation[keys[1]] : ''} error={error && validation[keys[1]] !== '' ? true : false} />
                <TextField type='number' onKeyDown={(evt) => config.decimalOnly.includes(evt.key) && evt.preventDefault()} inputProps={{ step: '0.10' }} label={config.text[keys[2]]} name={keys[2]} onChange={handleChange} value={invoice[keys[2]]} required helperText={error ? validation[keys[2]] : ''} error={error && validation[keys[2]] !== '' ? true : false} />
                <AccordionList list={currencies} name={keys[3]} handleChange={handleChange} accId='currency' dtlId='currencies' req={true} error={error} validation={validation[keys[3]]} id={id !== '0' ? invoice[keys[3]] : undefined} />
                <InputLabel>{config.text.products}</InputLabel>
                <Box mb={5}>
                    {orders.length > 0 ?
                        <Table size='small'>
                            <TableHeader data={orderKeys.map(k => config.text[k])} action={true} />
                            <TableBody>
                                {orders.map(o => {
                                    return <TableRow key={o.productId}>
                                        <TableCell>
                                            {o.productId}
                                        </TableCell>
                                        <TableCell>
                                            {o.name}
                                        </TableCell>
                                        <TableCell>
                                            <TextField type='number' onKeyDown={(evt) => config.decimalOnly.includes(evt.key) && evt.preventDefault()} required value={o.orderPrice} onChange={e => handleOrderPrice(o.productId, e)} />
                                        </TableCell>
                                        <TableCell>
                                            <TextField type='number' onKeyDown={(evt) => ["e", "E", "+", "-"].includes(evt.key) && evt.preventDefault()} required value={o.quantity} onChange={e => handleOrderQuantity(o.productId, e)} />
                                        </TableCell>
                                        <TableCell>
                                            <Delete onClick={() => handleOrder(o)} sx={{ cursor: 'pointer' }} />
                                        </TableCell>
                                    </TableRow>
                                })}
                            </TableBody>
                        </Table> :
                        null
                    }
                </Box>
                <SubmitButton id={id} pro={pro} />
            </Box>
            <Models models={config.text.products} api={props.addapi} selectable={true} handleCheck={handleOrder} selectedIds={orders.map(a => a.productId)} />
        </Box>
    )
}