import { TableCell, TableHead, TableRow } from '@mui/material'

export default function TableHeader(props) {
    return (
        <TableHead>
            <TableRow>
                {props.data.map((c, i) => (
                    <TableCell key={i} component='th' sx={{ border: props.bordered ? '1px solid black' : null }}>
                        <strong>{c}</strong>
                    </TableCell>
                ))}
                {/* {props.data.map((c, i) => (
                    <TableCell key={i} component='th'>
                        <strong>{c === 'name' && props.human ? config.text.humanName : config.text[c]}</strong>
                    </TableCell>
                ))} */}
                {props.action ?
                    <TableCell component='th'>
                        <strong>
                            Действия
                        </strong>
                    </TableCell> :
                    null
                }
                {props.selectable ?
                    <TableCell component='th'>
                        <strong>
                            Выбрать
                        </strong>
                    </TableCell> :
                    null
                }
            </TableRow>
        </TableHead>
    )
}