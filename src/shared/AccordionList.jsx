import { useState } from 'react'
import { Accordion, AccordionDetails, AccordionSummary, Box, Checkbox, TextField } from '@mui/material'
import config from '../configs/config.json'
import { useEffect } from 'react'
import { ExpandMore } from '@mui/icons-material'

export default function AccordionList(props) {

    const [selected, setSelected] = useState('')
    const [selected2, setSelected2] = useState('')
    const [id, setId] = useState(props.id === undefined ? null : props.id)
    const [checkList, setCheckList] = useState(null)
    const [toSelect, setToSelect] = useState(true)
    const [list, setList] = useState(props.list)
    const [search, setSearch] = useState('')

    useEffect(() => {
        if (list === null)
            setSelected('')
        function selectList(list) {
            // console.log(`selectList`)
            return list.map((l, i) => {
                const isSelected = l.id === parseInt(id)
                if (isSelected)
                    props.setSelected !== undefined ? props.setSelected(l.name) : setSelected(l.name)
                const checkBox = <Checkbox checked={isSelected} onClick={e => e.stopPropagation()} onChange={e => handleCheck(e, id, props.parentId)} name={props.name} value={l.id} />
                return <Box key={l.id} sx={{ alignItems: 'center' }}>
                    {checkBox}
                    <Box sx={{ display: 'inline-flex' }}>
                        {l.name}
                        {l.list === undefined || l.list.length === 0 || !isSelected ? null : <AccordionList sx={{ display: 'inline-flex' }} parentId={l.id} setSelected={setSelected2} name={props.name2} tableCell={true} list={l.list} handleChange={props.handleChange} accId={`${i}y`} dtlId={`${i}ss`} id={props.id !== '0' ? l.list.map(x => x.id).find((e) => {
                            return props.checklist.map(e => e.id).includes(String(e))
                        }) : undefined} />}
                    </Box>
                </Box>
            })
        }
        function handleCheck(e, id, parentId) {
            props.handleChange(e, id, parentId)
            if (e.target.checked) {
                setId(e.target.value)
                setSelected2('')
            }
            if (!e.target.checked) {
                setId(null)
                if (props.setSelected !== undefined)
                    props.setSelected('')
                else {
                    setSelected('')
                    setSelected2('')
                }
                e.target.value = ''
            }
            setToSelect(true)
        }
        if (toSelect || props.tableCell) {
            if (props.list !== null) {
                const x = selectList(props.list)
                setCheckList(x)
            }
            else {
                setCheckList(null)
            }
            if (props.id === '' && id !== props.id) {
                setSelected('')
                setId(props.id)
            }
            if (search !== '') {
                const newList = props.list.filter(l => l.name.toLowerCase().includes(search.toLowerCase()))
                const x = selectList(newList)
                setCheckList(x)
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
        // return setId(null)
    }, [toSelect, props, props.id, id, selected, list, search])

    function changeSearch(e) {
        setSearch(e.target.value)
        setToSelect(true)
    }

    return <Accordion>
        <AccordionSummary sx={props.sx} expandIcon={<ExpandMore />} aria-controls={props.dtlId} id={props.accId}>
            {props.tableCell ?
                <Box ml={2}>{selected} {selected2}</Box> :
                <TextField type='text' label={config.text[props.accId]} value={selected} name={props.name} required={props.req} helperText={props.error ? props.validation : ''} error={props.error && props.validation !== '' ? true : false} />
            }
        </AccordionSummary>
        <AccordionDetails id={props.dtlId}>
            <TextField value={search} onChange={changeSearch} />
            {checkList}
        </AccordionDetails>
    </Accordion>
}