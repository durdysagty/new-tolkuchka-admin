import { Add } from '@mui/icons-material'
import { IconButton, Link } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'

export default function AddItem(props) {
    return (
        <IconButton color='primary' sx={{ paddingY: 0 }}>
            <Link to={props.path} component={RouterLink}>
                <Add />
            </Link>
        </IconButton>
    )
}