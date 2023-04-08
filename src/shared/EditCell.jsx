import { ContentCopy, Delete, Edit, EditAttributesSharp, ListAlt, Print } from "@mui/icons-material"
import { Box, Link } from "@mui/material"
import { Link as RouterLink } from 'react-router-dom'

export default function EditCell(props) {
    return (
        <Box>
            {
                props.watchable ?
                    <Link to={`/${props.api}/${props.id}${props.parName === undefined ? '' : `/${props.parId}/${props.parName.replace('/', '-')}`}`} component={RouterLink} >
                        <ListAlt />
                    </Link> :
                    null
            }
            {
                props.notEditable ?
                    null :
                    <Link to={`/${props.api}/edt/${props.id}${props.parName === undefined ? '' : `/${props.parId}/${props.parName.replace('/', '-')}`}`} component={RouterLink} >
                        <Edit />
                    </Link>
            }
            {
                props.api2 === undefined ?
                    null :
                    <Link to={`/${props.api2}/${props.api}/${props.id}${props.name === undefined ? '' : `/${props.name.replace('/', '-')}`}`} component={RouterLink} sx={{ marginLeft: 2 }} >
                        <EditAttributesSharp />
                    </Link>
            }
            {
                props.api3 === undefined ?
                    null :
                    <Link to={`/${props.api3}/${props.api}/${props.id}${props.name === undefined ? '' : `/${props.name.replace('/', '-')}`}`} component={RouterLink} sx={{ marginLeft: 2 }} >
                        <Print />
                    </Link>
            }
            {
                props.pro ?
                    <Link to={`/${props.api}/sim/${props.id}${props.parName === undefined ? '' : `/${props.parId}/${props.parName.replace('/', '-')}`}`} component={RouterLink} sx={{ marginLeft: 2 }} >
                        <ContentCopy />
                    </Link> :
                    null
            }
            {
                props.notEditable ?
                    null :
                    <Delete onClick={props.delete} sx={{ cursor: 'pointer', marginX: 2 }} />
            }
        </Box>
    )
}