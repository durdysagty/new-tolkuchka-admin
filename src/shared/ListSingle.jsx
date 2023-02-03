import { useState, useEffect } from 'react'
import { Box, Checkbox, InputLabel, Typography } from '@mui/material'
import config from '../configs/config.json'
import { Delete } from '@mui/icons-material'

export default function ListSingle(props) {

    const [ids, setIds] = useState(props.checkList)
    const [deletedIds, setDeletedIds] = useState(props.deletedList)
    const [toSelect, setToSelect] = useState(true)
    const [checkList, setCheckList] = useState(null)
    const [list, setList] = useState(props.list)
    //if use search
    //const [newList, setNewList] = useState(null)

    useEffect(() => {
        function selectList(list) {
            console.log(`listSingleAddable`)
            return list.map(l => {
                if (!deletedIds.includes(l.id)) {
                    const isSelected = ids !== null ? ids.includes(parseInt(l.id)) || l.id === 0 : false
                    const checkBox = <Checkbox checked={isSelected} disabled={l.id === 0} onClick={e => e.stopPropagation()} onChange={e => handleCheck(e)} name={props.name} value={l.id} />
                    return <Box key={l.name} display='inline-flex'>
                        <Typography sx={{ display: 'flex', alignItems: 'center' }}>
                            {checkBox}
                            <span>{l.name}</span>
                            <Delete onClick={() => props.delete(l.id, l.name)} sx={{ cursor: 'pointer' }} />
                        </Typography>
                    </Box>
                }
                else {
                    return <Typography key={l.name} sx={{ display: 'flex', alignItems: 'center' }}>
                        <s>{l.name}</s>
                        <Delete onClick={() => props.delete(l.id)} sx={{ cursor: 'pointer' }} />
                    </Typography>
                }
            })
        }
        function handleCheck(e) {
            console.log(deletedIds)
            const array = ids.slice()
            if (e.target.checked)
                array.push(parseInt(e.target.value))
            else
                array.splice(array.indexOf(parseInt(e.target.value)), 1)
            setIds(array)
            props.setIds(array)
            setToSelect(true)
        }
        // used for search in list
        if (toSelect) {
            const x = selectList(props.list)
            setCheckList(x)
            setToSelect(false)
        }
        if (list !== props.list) {
            setList(props.list)
            setToSelect(true)
        }
        else if (deletedIds !== props.deletedList) {
            setDeletedIds(props.deletedList)
            setToSelect(true)
        }
        else {
            setToSelect(false)
        }
    }, [toSelect, ids, deletedIds, list, props])

    return <Box>
        <InputLabel>{config.text[props.mainText]}</InputLabel>
        {checkList}
    </Box>
}