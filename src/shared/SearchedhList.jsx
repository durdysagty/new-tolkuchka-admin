import { TextField } from '@mui/material'
import { useState } from 'react'
import config from '../configs/config.json'


export default function SearchedhList(props) {

    const [search, setSearch] = useState('')
    //const [newList, setNewList] = useState(null)

    function changeSearch(e) {
        setSearch(e.target.value)
        const newList = props.list.filter(l => l.name.toLowerCase().includes(e.target.value.toLowerCase()))
        props.setNewList(newList)
    }
    return (
        <TextField label={config.text.search} value={search} onChange={changeSearch} sx={{ marginY: 0 }} />
    )
}