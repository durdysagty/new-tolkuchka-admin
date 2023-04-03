import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import config from '../configs/config.json'
import PageHeader from '../shared/PageHeader'
import { Box, FormHelperText, Grid, InputLabel, Table, TableBody, TableCell, TableRow, Typography } from '@mui/material'
import TableHeader from '../shared/TableHeader'
import { getData, getEditModel } from '../shared/getData'
import SubmitButton from '../shared/SubmitButton'
import Progress from '../shared/Progress'
import { wait } from '@testing-library/user-event/dist/utils'

const x = {
    user: '',
    buyer: '',
    date: '',
    address: '',
    phone: ''
}
const keys = Object.keys(x)
const orderKeys = ['productId', 'name', 'serialNumbers', 'warranty', 'orderPrice', 'quantity', 'sum']

export default function InvoicePrint(props) {
    //#region states
    const { id } = useParams()
    const [invoice, setInvoice] = useState(x)
    const [orders, setOrders] = useState(null)
    const [once, setOnce] = useState('0')
    const [amount, setAmount] = useState(0)
    const [process] = useState(false)
    //#endregion
    useEffect(() => {
        if (once !== 1)
            setOnce(1)
        async function prepareData() {
            console.log('prepareData')
            let result = await getEditModel(`${props.api}/currency`, id)
            if (result.ok) {
                result.data.date = new Date(result.data.date).toLocaleString()
                setInvoice(result.data)
            }
            else
                setSubmitError(config.text.wrong)
            result = await getData(`${props.api}/orders/${id}`, config.text[result.data.language])
            if (result.ok) {
                result.data.forEach(p => p.orderPrice = parseFloat(p.orderPrice))
                const amount = result.data.reduce((acc, curVal) => acc + curVal.orderPrice * curVal.quantity, 0)
                setAmount(amount)
                setOrders(result.data)
            }
            else
                setSubmitError(config.text.wrong)
        }
        if (orders === null && once === 1)
            prepareData()
    }, [once, props.api, props.dataFrom, id, orders, process])

    const [submitError, setSubmitError] = useState('')
    async function submit(e) {
        e.preventDefault()
        // setProcess(true)
        await wait(0)
        const print = document.getElementById('invoice')
        document.getElementById('root').innerHTML = print.innerHTML
        window.print()
        window.location.href = '/invoices'
        // setProcess(false)
    }
    return (orders === null || process ?
        <Progress /> :
        <Box>
            <PageHeader id={id} api={props.api} pro='print' name={` #${id}`} />
            <Box id='invoice' margin='auto'>
                <FormHelperText error>{submitError}</FormHelperText>
                <Box p={4}>
                    <Box textAlign='center'>
                        <img src={`${config.apibase}logo.png`} alt='logo' />
                    </Box>
                    <Typography variant='h4'>{`${config.text[`${invoice.language}.invoice`]} #${id}`}</Typography>
                    <Box my={2}>
                        {keys.map((text, i) => <Grid container key={i} sx={{ display: 'flex' }}>
                            <Grid item xs={6} sm={3} lg={2}>
                                <InputLabel sx={{ color: 'black', fontSize: 20 }} >{config.text[`${invoice.language}.${text}`]}</InputLabel>
                            </Grid>
                            <InputLabel sx={{ color: 'black', fontSize: 20 }} ><strong>{invoice[text]}</strong></InputLabel>
                        </Grid>)}
                    </Box>
                    <Box>
                        {orders.length > 0 ?
                            <Table>
                                <TableHeader bordered={true} data={orderKeys.map(k => (
                                    k === 'orderPrice' || k === 'sum' ? `${config.text[`${invoice.language}.${k}`]}, ${invoice.currencyCodeName}` : config.text[`${invoice.language}.${k}`]
                                ))} />
                                <TableBody>
                                    {orders.map((o, i) => {
                                        return <TableRow key={o.productId}>
                                            <TableCell sx={{ border: '1px solid black' }}>
                                                {i + 1}
                                            </TableCell>
                                            {orderKeys.slice(1, 6).map((k, i) => <TableCell key={i} sx={{ border: '1px solid black' }}>
                                                {o[k]}
                                            </TableCell>)}
                                            <TableCell sx={{ border: '1px solid black' }}>
                                                {o.orderPrice * o.quantity}
                                            </TableCell>
                                        </TableRow>
                                    })}
                                    <TableRow>
                                        <TableCell colSpan={4} sx={{ border: '1px solid black' }}></TableCell>
                                        <TableCell colSpan={2} sx={{ border: '1px solid black' }}><strong>{config.text[`${invoice.language}.deliveryCost`]}</strong></TableCell>
                                        <TableCell sx={{ border: '1px solid black' }}>{invoice.deliveryCost}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell colSpan={4} sx={{ border: '1px solid black' }}></TableCell>
                                        <TableCell colSpan={2} sx={{ fontSize: 20, border: '1px solid black' }}><strong>{config.text[`${invoice.language}.amount`]}</strong></TableCell>
                                        <TableCell sx={{ fontSize: 20, border: '1px solid black' }}>{amount + invoice.deliveryCost}</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table> :
                            null
                        }
                        <Box pt={3}>
                            <Typography variant='h5' textAlign='center'>{config.text[`${invoice.language}.wt`]}</Typography>
                            <Typography textAlign='justify' sx={{ fontWeight: 'bold' }}>{config.text[`${invoice.language}.wLine`]}.</Typography>
                            <Typography textAlign='justify'>{config.text[`${invoice.language}.wProvide`]}.</Typography>
                            <Typography textAlign='justify' ml={2}>{config.text[`${invoice.language}.wCond`]}:</Typography>
                            <Box ml={3}>
                                <Typography textAlign='justify'>{config.text[`${invoice.language}.wSeal`]};</Typography>
                                <Typography textAlign='justify'>{config.text[`${invoice.language}.wSticker`]}.</Typography>
                            </Box>
                            <Typography textAlign='justify' ml={2}>{config.text[`${invoice.language}.wDefect`]}:</Typography>
                            <Box ml={3}>
                                <Typography textAlign='justify'>{config.text[`${invoice.language}.wNonobs`]};</Typography>
                                <Typography textAlign='justify'>{config.text[`${invoice.language}.wDamage`]};</Typography>
                                <Typography textAlign='justify'>{config.text[`${invoice.language}.wOver`]};</Typography>
                                <Typography textAlign='justify'>{config.text[`${invoice.language}.wRepair`]};</Typography>
                                <Typography textAlign='justify'>{config.text[`${invoice.language}.wResulting`]};</Typography>
                                <Typography textAlign='justify'>{config.text[`${invoice.language}.wChange`]}.</Typography>
                            </Box>
                            <Typography textAlign='justify' ml={2}>{config.text[`${invoice.language}.wNotCover`]}:</Typography>
                            <Box ml={3}>
                                <Typography textAlign='justify'>{config.text[`${invoice.language}.wPackaging`]};</Typography>
                                <Typography textAlign='justify'>{config.text[`${invoice.language}.wWear`]};</Typography>
                                <Typography textAlign='justify'>{config.text[`${invoice.language}.wCause`]}.</Typography>
                            </Box>
                            <Typography textAlign='justify'>{config.text[`${invoice.language}.wNotinc`]}.</Typography>
                            <Typography textAlign='justify'>{config.text[`${invoice.language}.wLoss`]}.</Typography>
                            <Typography textAlign='justify'>{config.text[`${invoice.language}.wReserve`]}.</Typography>
                        </Box>
                    </Box>
                </Box>
            </Box>
            <Box component='form' onSubmit={submit} margin='auto' >
                <SubmitButton id={id} pro='print' />
            </Box>
        </Box >
    )
}