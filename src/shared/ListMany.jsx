import { useState } from 'react'
import { Checkbox, Grid, InputLabel, Table, TableBody, TableCell, TableRow, Typography } from '@mui/material'
import config from '../configs/config.json'
import { useEffect } from 'react'

export default function ListMany(props) {
    const [ids, setIds] = useState(props.checkList === undefined ? null : props.checkList)
    const [list, setList] = useState(null)
    const [once, setOnce] = useState(0)

    useEffect(() => {
        setOnce(1)
        function selectList(list) {
            // console.log(`selectsList`)
            return list.map(l => {
                const isSelected = ids !== null ? ids.map(e => String(e[0])).includes(String(l.id)) : false
                const checkBox = <Checkbox checked={isSelected} onClick={e => e.stopPropagation()} onChange={e => handleCheck(e)} name={props.name} value={l.id} />
                const isSelected2 = ids !== null && isSelected ? ids.find(e => String(e[0]) === String(l.id))[1] > 0 : false
                const checkBox2 = <Checkbox checked={isSelected2} disabled={!isSelected} onClick={e => e.stopPropagation()} onChange={e => handleCheck2(l.id, e)} name={props.name} />
                return <TableRow key={l.id}>
                    <TableCell sx={{ border: 'none', paddingY: 0 }}>
                        <Typography sx={{ display: 'flex', alignItems: 'center' }}>
                            {checkBox}
                            <span>{l.name}</span>
                        </Typography>
                    </TableCell>
                    <TableCell sx={{ border: 'none', paddingY: 0 }} align='center'>
                        {checkBox2}
                    </TableCell>
                </TableRow>
            })
        }
        function handleCheck(e) {
            const array = ids === null ? [] : ids.slice()
            if (e.target.checked) {
                array.push([e.target.value, 0])
            }
            else
                array.splice(array.indexOf(array.find(el => String(el[0]) === e.target.value)), 1)
            setIds(array)
            props.handleChange(array)
        }
        function handleCheck2(id, e) {
            const array = ids.slice()
            const i = array.indexOf(array.find(el => String(el[0]) === String(id)))
            if (e.target.checked) {
                array[i][1] = 1
            }
            else
                array[i][1] = 0
            setIds(array)
            props.handleChange(array)
        }
        if (once === 1) {
            if (props.list !== null) {
                const x = selectList(props.list)
                setList(x)
            }
            else
                setList(null)
        }
    }, [once, props, props.id, ids])

    return <Grid container>
        <Grid item xs={10} sm={8} md={6} lg={4} xl={3}>
            <Table size='small'>
                <TableBody>
                    <TableRow>
                        <TableCell sx={{ border: 'none', paddingX: 0 }}><InputLabel>{config.text[props.mainText]}</InputLabel></TableCell>
                        <TableCell sx={{ border: 'none' }} align='center'><InputLabel>{config.text[props.secondText]}</InputLabel></TableCell>
                    </TableRow>
                    {list}
                </TableBody>
            </Table>
        </Grid>
    </Grid>
}