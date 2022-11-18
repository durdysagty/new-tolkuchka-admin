import { TableCell, TableHead, TableRow } from '@mui/material'
import config from '../configs/config.json'

export default function TableHeader(props) {

    return (
        <TableHead>
            <TableRow>
                {props.data.map((c, i) => (
                    <TableCell key={i} component='th'>
                        <strong>{c === 'name' && props.human ? config.text.humanName : config.text[c]}</strong>
                    </TableCell>
                ))}
                <TableCell component='th'>
                    <strong>
                        Действия
                    </strong>
                </TableCell>
            </TableRow>
        </TableHead>
    )
}