//#region imports
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import config from '../configs/config.json'
import PageHeader from '../shared/PageHeader'
import { Box, FormHelperText, TextField } from '@mui/material'
import { getEditModel } from '../shared/getData'
import { setJsonData } from '../shared/setData'
import { r } from '../shared/Result'
import SubmitButton from '../shared/SubmitButton'
import Progress from '../shared/Progress'
import { wait } from '@testing-library/user-event/dist/utils'
//#endregion
const x = {
    nameRu: '',
    nameEn: '',
    nameTm: ''
}
const keys = Object.keys(x)

export default function Warranty(props) {
    //#region states
    const { id } = useParams()
    const navigate = useNavigate()
    const [warranty, setWarranty] = useState(x)
    const [validation, setValidation] = useState(x)
    const [error, setError] = useState(false)
    const [once, setOnce] = useState('0')
    const [process, setProcess] = useState(false)
    //#endregion
    useEffect(() => {
        if (id !== '0') {
            setOnce(1)
            async function prepareData() {
                console.log('prepareData')
                const result = await getEditModel(props.api, id)
                if (result.ok)
                    setWarranty(result.data)
                else
                    setSubmitError(config.text.wrong)
            }
            if (warranty.nameRu === '' && once === 1)
                prepareData()
        }
    }, [once, props.api, id, warranty.nameRu, warranty.id, process])
    //#region functions
    function handleChange(e) {
        setWarranty(prevState => ({ ...prevState, [e.target.name]: e.target.value }))
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
    //#endregion
    async function submit(e) {
        e.preventDefault()
        setProcess(true)
        await wait(0)
        let i = id
        if (pro === 'sim') {
            delete warranty.id
            i = '0'
        }
        const response = await setJsonData(props.api, i, warranty)
        if (response.ok)
            if (response.result === r.success)
                navigate(-1)
            else
                setSubmitError(config.text.already2)
        else
            setSubmitError(config.text.wrong)
        setProcess(false)
    }


    return ((id !== '0' && warranty.nameRu === '') || process ?
        <Progress /> :
        <Box>
            <PageHeader id={id} pro={pro} api={props.api} />
            <Box component='form' onSubmit={submit} onInvalid={invalid} margin='auto' >
                <FormHelperText error>{submitError}</FormHelperText>
                {keys.map((text, i) => (
                    <TextField type='text' label={config.text[text]} name={text} onChange={handleChange} value={warranty[text]} key={i} required helperText={error ? validation[text] : ''} error={error && validation[text] !== '' ? true : false} />
                ))}
                <SubmitButton id={id} pro={pro} />
            </Box >
        </Box>
    )
}