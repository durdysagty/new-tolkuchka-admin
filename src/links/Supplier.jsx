import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import config from '../configs/config.json'
import PageHeader from '../shared/PageHeader'
import { Box, FormHelperText, TextField } from '@mui/material'
import { getEditModel } from '../shared/getData'
import { setJsonData } from '../shared/setData'
import { r } from '../shared/Result'
import SubmitButton from '../shared/SubmitButton'

const x = {
    name: '',
    phoneMain: '',
    phoneSecondary: '',
    address: ''
}
const keys = Object.keys(x)

export default function Supplier(props) {

    const { id } = useParams()
    const navigate = useNavigate()
    const [supplier, setSupplier] = useState(x)
    const [validation, setValidation] = useState(x)
    const [error, setError] = useState(false)
    const [once, setOnce] = useState('0')

    useEffect(() => {
        if (id !== '0') {
            setOnce(1)
            async function prepareData() {
                console.log('prepareData')
                const result = await getEditModel(props.api, id)
                if (result.ok)
                    setSupplier(result.data)
                else
                    setSubmitError(config.text.wrong)
            }
            if (supplier.name === '' && once === 1)
                prepareData()
        }
    }, [once, props.api, id, supplier.name, supplier.id])

    function handleChange(e) {
        setSupplier(prevState => ({ ...prevState, [e.target.name]: e.target.value }))
        setValidation(prevState => ({
            ...prevState,
            [e.target.name]: ''
        }))
    }

    function invalid(e) {
        e.preventDefault()
        setValidation(prevState => ({
            ...prevState,
            [e.target.name]: config.text.empty
        }))
        setError(true)
    }

    const [submitError, setSubmitError] = useState('')

    const { pro } = useParams()
    async function submit(e) {
        e.preventDefault()
        let i = id
        if (pro === 'sim') {
            delete supplier.id
            i = '0'
        }
        const response = await setJsonData(props.api, i, supplier)
        if (response.ok)
            if (response.result === r.success)
                navigate(-1)
            else
                setSubmitError(config.text.already2)
        else
            setSubmitError(config.text.wrong)
    }


    return (
        <Box>
            <PageHeader id={id} pro={pro} api={props.api} />
            <Box component='form' onSubmit={submit} onInvalid={invalid} margin='auto' >
                <FormHelperText error>{submitError}</FormHelperText>
                {keys.map((text, i) => (
                    <TextField type={text.includes('phone') ? 'number' : 'text'} onKeyDown={text.includes('phone') ? (evt) => ["e", "E", "+", "-"].includes(evt.key) && evt.preventDefault() : null} label={config.text[text]} name={text} onChange={handleChange} value={supplier[text]} key={i} required={text !== 'phoneSecondary'} helperText={error ? validation[text] : ''} error={error && validation[text] !== '' ? true : false} />
                ))}
                <SubmitButton id={id} pro={pro} />
            </Box >
        </Box>
    )
}