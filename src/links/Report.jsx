import { useEffect, useState } from 'react'
import config from '../configs/config.json'
import PageHeader from '../shared/PageHeader'
import { Box, FormHelperText, Grid, Table, TableBody, TableCell, TableRow, TextField, Typography } from '@mui/material'
import { getData } from '../shared/getData'
import Progress from '../shared/Progress'
import Models from '../shared/Models'
import { Autorenew } from '@mui/icons-material'

const date = new Date()
const startDate = `${date.getFullYear()}-${date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1}-01`
const endDate = `${date.getFullYear()}-${date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1}-${date.getDate() < 10 ? `0${date.getDate()}` : date.getDate()}`

export default function Report(props) {

    const [reportOrders, setReportOrders] = useState(null)
    const [start, setStart] = useState(startDate)
    const [end, setEnd] = useState(endDate)
    const [profit, setProfit] = useState(0)
    const [income, setIncome] = useState(0)
    const [profitability, setProfitability] = useState(0)
    const [once, setOnce] = useState('0')

    useEffect(() => {
        setOnce(1)
        async function prepareData() {
            console.log('prepareData')
            const result = await getData(props.api, null, { start: start, end: end })
            if (result.ok) {
                setReportOrders(result.data)
                if (result.data.models.length > 0) {
                    const val = result.data.models.reduce((acc, curVal) => {
                        acc.profit = acc.profit + curVal.netProfit
                        acc.income = acc.income + curVal.soldPrice
                        return acc
                    }, {
                        profit: 0,
                        income: 0
                    })
                    setProfit(val.profit.toFixed(2))
                    setIncome(val.income.toFixed(2))
                    setProfitability((val.profit / val.income * 100).toFixed(2))
                }
            }
            else if (result.status === 403) {
                setReportOrders(403)
            }
            else
                setSubmitError(config.text.wrong)
        }
        if (reportOrders === null && once === 1)
            prepareData()
    }, [once, props.api, reportOrders, start, end])

    const [submitError, setSubmitError] = useState('')
    function submit() {
        setReportOrders(null)
        setProfit(0)
        setIncome(0)
        setProfitability(0)
    }

    return (reportOrders === null ?
        <Progress /> :
        reportOrders === 403 ?
            <Typography>{config.text.s403}</Typography> :
            <Box>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={3}>
                        <PageHeader text={config.text.report} />
                    </Grid>
                    <Grid item xs={6} md={3} display='flex'>
                        <Typography component='span' variant='h6' mr={2}>c</Typography>
                        <TextField type='date' sx={{ margin: 0 }} value={start} onChange={e => setStart(e.target.value)} />
                    </Grid>
                    <Grid item xs={6} md={3} display='flex'>
                        <Typography component='span' variant='h6' mr={2}>по</Typography>
                        <TextField type='date' sx={{ margin: 0 }} value={end} onChange={e => setEnd(e.target.value)} />
                    </Grid>
                    <Grid item xs={6} md={3} display='flex'>
                        <Autorenew onClick={submit} sx={{ cursor: 'pointer' }} />
                    </Grid>
                </Grid>
                <FormHelperText error>{submitError}</FormHelperText>
                <Models list={reportOrders} noCheckBox={true} />
                <Table>
                    <TableBody>
                        <TableRow>
                            <TableCell align='right'>
                                <Typography variant='h6'>
                                    Прибыль за период:
                                </Typography>
                            </TableCell>
                            <TableCell align='right'>
                                <Typography variant='h5'>
                                    {profit}
                                </Typography>
                            </TableCell>
                            <TableCell>
                                <Typography variant='h5'>
                                    USD
                                </Typography>
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell align='right'>
                                <Typography variant='h6'>
                                    Оборот за период:
                                </Typography>
                            </TableCell>
                            <TableCell align='right'>
                                <Typography variant='h5'>
                                    {income}
                                </Typography>
                            </TableCell>
                            <TableCell>
                                <Typography variant='h5'>
                                    USD
                                </Typography>
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell align='right'>
                                <Typography variant='h6'>
                                    Рентабельность:
                                </Typography>
                            </TableCell>
                            <TableCell align='right'>
                                <Typography variant='h5'>
                                    {profitability}
                                </Typography>
                            </TableCell>
                            <TableCell>
                                <Typography variant='h5'>
                                    %
                                </Typography>
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </Box>
    )
}