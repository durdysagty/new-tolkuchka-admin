import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import config from '../configs/config.json'
import PageHeader from '../shared/PageHeader'
import { Box, FormHelperText, Table, TableBody, TableCell, TableRow } from '@mui/material'
import { getEditModel } from '../shared/getData'
import Progress from '../shared/Progress'
import Models from '../shared/Models'

const x = {
    id: '',
    email: '',
    humanName: '',
    phone: '',
    address: '',
    invoices: ''
}
const keys = Object.keys(x)

export default function User(props) {
    //#region states
    const { id } = useParams()
    // const navigate = useNavigate()
    const [user, setUser] = useState(null)
    const [error, setError] = useState(false)
    // const [currencies, setCurrencies] = useState(null)
    const [once, setOnce] = useState('0')

    //#endregion
    useEffect(() => {
        if (once !== 1)
            setOnce(1)
        async function prepareData() {
            const result = await getEditModel(props.api, id)
            if (result.ok)
                setUser(result.data)
            else
                setError(config.text.wrong)
        }
        if (user === null && once === 1)
            prepareData()
    }, [once, props.api, props.dataFrom, id, user])

    return (user === null ?
        <Progress /> :
        <Box>
            <PageHeader id={id} api={props.api} text={config.text.user} />
            <FormHelperText error>{error}</FormHelperText>
            <Table>
                <TableBody>
                    {keys.map((text, i) => <TableRow key={i}>
                        <TableCell>
                            {config.text[text]}
                        </TableCell>
                        <TableCell>
                            {user[text]}
                        </TableCell>
                    </TableRow>)}
                </TableBody>
            </Table>
            <Models models={config.text.invoices} api={`${props.dataFrom[0]}`} notEditable={true} notAdd={true} listKey='orders' selectorKey={{ user: id }} />
        </Box>
    )
}