import { useState } from 'react'
import { Checkbox, Grid, InputLabel, Table, TableBody, TableCell, TableRow, Typography } from '@mui/material'
import config from '../configs/config.json'
import { useEffect } from 'react'
import SearchedhList from './SearchedhList'

export default function ListMany(props) {
    const [ids, setIds] = useState(props.checkList)
    const [toSelect, setToSelect] = useState(true)
    const [checkList, setCheckList] = useState(null)
    const [list, setList] = useState(props.list)
    const [newList, setNewList] = useState(null)

    useEffect(() => {
        function selectList(list) {
            console.log(`listMany`)
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
            const array = ids.slice()
            if (e.target.checked) {
                // props.selectedSpecs.push([e.target.value, 0])
                array.push([e.target.value, 0])
            }
            else {
                // props.selectedSpecs.splice(props.selectedSpecs.indexOf(props.selectedSpecs.find(el => String(el[0]) === e.target.value)), 1)
                array.splice(array.indexOf(array.find(el => String(el[0]) === e.target.value)), 1)
            }
            setIds(array)
            props.setIds(array)
            setToSelect(true)
        }
        function handleCheck2(id, e) {
            const array = ids.slice()
            const i = array.indexOf(array.find(el => String(el[0]) === String(id)))
            if (e.target.checked) {
                array[i][1] = 1
                //props.selectedSpecs[i][1] = 1
            }
            else {
                array[i][1] = 0
                //props.selectedSpecs[i][1] = 0
            }
            setIds(array)
            props.setIds(array)
            setToSelect(true)
            // console.log(ids)
            // console.log(props.selectedSpecs)
        }
        if (toSelect || newList !== null) {
            if (newList === null) {
                const x = selectList(props.list)
                setCheckList(x)
            }
            else {
                const list = selectList(newList)
                setCheckList(list)
            }
            setToSelect(false)
        }
        if (list !== props.list) {
            setToSelect(true)
            setList(props.list)
        }
        else {
            setToSelect(false)
        }
    }, [toSelect, props.list, props.name, props.selectedSpecs, ids, list, newList, props])

    return <Grid container>
        <Grid item xs={10} sm={8} md={7} lg={5}>
            <Table size='small'>
                <TableBody>
                    <TableRow>
                        <TableCell sx={{ border: 'none', paddingX: 0 }}><InputLabel>{config.text[props.mainText]}</InputLabel></TableCell>
                        <TableCell sx={{ border: 'none' }} align='center'><InputLabel>{config.text[props.secondText]}</InputLabel></TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell colSpan={2} sx={{ border: 'none' }}>
                            <SearchedhList list={props.list} setNewList={setNewList} />
                        </TableCell>
                    </TableRow>
                    {checkList}
                </TableBody>
            </Table>
        </Grid>
    </Grid>
}