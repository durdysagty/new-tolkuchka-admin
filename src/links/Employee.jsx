import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import config from '../configs/config.json'
import PageHeader from '../shared/PageHeader'
import { Box, FormHelperText, TextField } from '@mui/material'
import { getData, getEditModel } from '../shared/getData'
import Progress from '../shared/Progress'
import { setJsonData } from '../shared/setData'
import Selectables from '../shared/Selectables'
import { r } from '../shared/Result'
import SubmitButton from '../shared/SubmitButton'
import { wait } from '@testing-library/user-event/dist/utils'

const x = {
    login: '',
    password: '',
    positionId: ''
}
const keys = Object.keys(x)

export default function Employee(props) {

    const { id } = useParams()
    const navigate = useNavigate()
    const [employee, setEmployee] = useState(x)
    const [validation, setValidation] = useState(x)
    const [error, setError] = useState(false)
    const [positions, setPositions] = useState(null)
    const [once, setOnce] = useState(0)
    const [process, setProcess] = useState(false)

    useEffect(() => {
        setOnce(1)
        async function prepareData() {
            console.log('prepareData')
            let result = await getData(props.dataFrom)
            if (result.ok)
                setPositions(result.data.models)
            else
                setError(config.text.wrong)
            if (id !== '0') {
                result = await getEditModel(props.api, id)
                if (result.ok)
                    setEmployee(result.data)
                else
                    setSubmitError(config.text.wrong)
            }
        }
        if (positions === null && once === 1)
            prepareData()
    }, [once, props.api, props.dataFrom, positions, id, process])

    function handleChange(e) {
        setEmployee(prevState => ({ ...prevState, [e.target.name]: e.target.value }))
        setValidation(prevState => ({
            ...prevState,
            [e.target.name]: ''
        }))
    }

    function invalid(e) {
        e.preventDefault()
        if (e.target.validity.valueMissing)
            setValidation(prevState => ({
                ...prevState,
                [e.target.name]: config.text.empty
            }))
        setError(true)
    }

    const [submitError, setSubmitError] = useState('')

    async function submit(e) {
        e.preventDefault()
        setProcess(true)
        await wait(0)
        const response = await setJsonData(props.api, id, employee)
        if (response.ok)
            if (response.result === r.success)
                navigate(-1)
            else
                setSubmitError(config.text.already2)
        else
            setSubmitError(config.text.wrong)
        setProcess(false)
    }


    return (positions === null || process ?
        <Progress /> :
        <Box>
            <PageHeader id={id} api={props.api} />
            <Box component='form' onSubmit={submit} onInvalid={invalid} margin='auto' >
                <FormHelperText error>{submitError}</FormHelperText>
                <TextField disabled={id === '0' ? false : true} type='text' label={config.text.login} name={keys[0]} onChange={handleChange} value={employee.login} required helperText={error ? validation.login : ''} error={error && validation.login !== '' ? true : false} />
                <TextField type='password' label={config.text.password} name={keys[1]} onChange={handleChange} value={employee.password} required helperText={error ? validation.password : ''} error={error && validation.password !== '' ? true : false} />
                <Selectables req={true} items={positions} value={employee.positionId} handleChange={handleChange} label={props.dataFrom} name={keys[2]} validation={validation.positionId} error={error} dataFrom={props.dataFrom} />
                <SubmitButton id={id} />
            </Box >
        </Box>
    )
}