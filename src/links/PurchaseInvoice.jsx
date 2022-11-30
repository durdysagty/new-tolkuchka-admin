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

const x = {
    currencyId: '',
    supplierId: '',
    currencyRate: 1
}
const keys = Object.keys(x)

export default function PurchaseInvoice(props) {

    const { id } = useParams()
    const navigate = useNavigate()
    const [purchaseInvoice, setPurchaseInvoice] = useState(x)
    const [validation, setValidation] = useState(x)
    const [error, setError] = useState(false)
    const [currencies, setCurrencies] = useState(null)
    const [suppliers, setSuppliers] = useState(null)
    const [purchases, setPurchases] = useState([])
    const [once, setOnce] = useState('0')

    useEffect(() => {
        if (once !== 1)
            setOnce(1)
        async function prepareData() {
            console.log('prepareData')
            let result = await getData(props.dataFrom[0])
            if (result.ok)
                setCurrencies(result.data.map(c => ({
                    id: c.id,
                    name: c.codeName,
                    realRate: c.realRate.toLocaleString()
                })))
            else
                setError(config.text.wrong)
            result = await getData(props.dataFrom[1])
            if (result.ok)
                setSuppliers(result.data)
            else
                setError(config.text.wrong)
            if (id !== '0') {
                result = await getData(`${props.api}/purchases/${id}`)
                if (result.ok) {
                    result.data.forEach(p => p.purchasePrice = parseFloat(p.purchasePrice))
                    setPurchases(result.data)
                }
                else
                    setError(config.text.wrong)
                result = await getEditModel(props.api, id)
                if (result.ok) {
                    result.data.currencyRate = result.data.currencyRate.toLocaleString()
                    setPurchaseInvoice(result.data)
                }
                else
                    setSubmitError(config.text.wrong)
            }
        }
        if (currencies === null && once === 1)
            prepareData()
    }, [once, props.api, props.dataFrom, purchaseInvoice.currencyId, id, purchases, currencies])
    // #region functions
    function handleChange(e) {
        setPurchaseInvoice(prevState => ({ ...prevState, [e.target.name]: e.target.value }))
        setValidation(prevState => ({
            ...prevState,
            [e.target.name]: ''
        }))
        if (e.target.name === 'currencyId') {
            const currency = currencies.find(c => c.id === parseInt(e.target.value))
            setPurchaseInvoice(prevState => ({ ...prevState, currencyRate: currency.realRate }))
        }
    }
    function invalid(e) {
        e.preventDefault()
        setValidation(prevState => ({
            ...prevState,
            [e.target.name]: config.text.empty
        }))
        setError(true)
    }

    function handlePurchase(p, e) {
        const array = purchases.slice()
        if (e !== undefined && e.target.checked) {
            const purchase = {
                productId: p.id,
                name: e.target.value,
                serialNumbers: [''],
                purchasePrice: 0,
                quantity: 1
            }
            array.push(purchase)
        }
        else {
            array.splice(array.indexOf(array.find(a => a.productId === p.productId)), 1)
        }
        setPurchases(array)
    }

    function handlePurchasePrice(id, e) {
        if (e.target.value > 0) {
            const array = purchases.slice()
            const p = array.find(p => p.productId === id)
            p.purchasePrice = parseFloat(e.target.value)
            setPurchases(array)
        }
    }

    function handlePurchaseQuantity(id, e) {
        if (e.target.value > 0) {
            const array = purchases.slice()
            const p = array.find(p => p.productId === id)
            p.quantity = parseInt(e.target.value)
            const oldSerials = p.serialNumbers
            if (e.target.value < oldSerials.length) {
                p.serialNumbers = oldSerials.slice(0, e.target.value)
            }
            else {
                const newSerials = Array.from({ length: e.target.value - oldSerials.length })
                newSerials.fill('')
                p.serialNumbers = oldSerials.concat(newSerials)
            }
            setPurchases(array)
        }
    }

    function handleSerialNumber(id, i, e) {
        const array = purchases.slice()
        const p = array.find(p => p.productId === id)
        p.serialNumbers[i] = e.target.value
        setPurchases(array)
        console.log(purchases)
    }

    const [submitError, setSubmitError] = useState('')

    const { pro } = useParams()
    //#endregion
    async function submit(e) {
        e.preventDefault()
        // console.log(purchases)
        // console.log(purchaseInvoice)
        if (purchases.length < 1) {
            setSubmitError(config.text.noPurchase)
            return
        }
        let i = id
        if (pro === 'sim')
            i = '0'
        const response = await setFormData(props.api, i, purchaseInvoice, null, {
            jsonPurchases: JSON.stringify(purchases)
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
    // const list = currencies.map(c => ({ id: c.id, name: c.codeName }))
    return ((id !== '0' && purchaseInvoice.currencyId === '') || currencies === null ?
        <Progress /> :
        <Box>
            <PageHeader id={id} pro={pro} api={props.api} />
            <Box component='form' onSubmit={submit} onInvalid={invalid} margin='auto' >
                <FormHelperText error>{submitError}</FormHelperText>
                <AccordionList list={currencies} name={keys[0]} handleChange={handleChange} accId='currency' dtlId='currencies' req={true} error={error} validation={validation[keys[0]]} id={id !== '0' ? purchaseInvoice.currencyId : undefined} />
                <AccordionList list={suppliers} name={keys[1]} handleChange={handleChange} accId='supplier' dtlId='suppliers' req={true} error={error} validation={validation[keys[1]]} id={id !== '0' ? purchaseInvoice.supplierId : undefined} />
                <InputLabel>{config.text.products}</InputLabel>
                <Box mb={5}>
                    {purchases.length > 0 ?
                        <Table size='small'>
                            <TableHeader data={Object.keys(purchases[0]).map(k => config.text[k])} />
                            <TableBody>
                                {purchases.map(p => {
                                    const serials = p.serialNumbers.map((s, i) => <TextField key={i} onChange={e => handleSerialNumber(p.productId, i, e)} type='text' value={s} />)
                                    return <TableRow key={p.productId}>
                                        <TableCell>
                                            {p.productId}
                                        </TableCell>
                                        <TableCell>
                                            {p.name}
                                        </TableCell>
                                        <TableCell>
                                            {serials}
                                        </TableCell>
                                        <TableCell>
                                            <TextField type='number' onKeyDown={(evt) => ["e", "E", "+", "-"].includes(evt.key) && evt.preventDefault()} required value={p.purchasePrice} onChange={e => handlePurchasePrice(p.productId, e)} />
                                        </TableCell>
                                        <TableCell>
                                            <TextField type='number' onKeyDown={(evt) => ["e", "E", "+", "-"].includes(evt.key) && evt.preventDefault()} required value={p.quantity} onChange={e => handlePurchaseQuantity(p.productId, e)} />
                                        </TableCell>
                                        <TableCell>
                                            <Delete onClick={() => handlePurchase(p)} sx={{ cursor: 'pointer' }} />
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
            <Models models={config.text.products} api={props.addapi} selectable={true} handleCheck={handlePurchase} selectedIds={purchases.map(a => a.productId)} />
        </Box>
    )
}