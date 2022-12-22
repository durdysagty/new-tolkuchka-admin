import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import config from '../configs/config.json'
import PageHeader from '../shared/PageHeader'
import { Box, FormHelperText, InputLabel } from '@mui/material'
import SubmitButton from '../shared/SubmitButton'
import { CKEditor } from 'ckeditor4-react'
import { getEditModel } from '../shared/getData'
import Progress from '../shared/Progress'
import { r } from '../shared/Result'
import { setJsonData } from '../shared/setData'

const x = {
    aboutRu: '',
    aboutEn: '',
    aboutTk: '',
    deliveryRu: '',
    deliveryEn: '',
    deliveryTk: ''
}

const keys = Object.keys(x)

export default function Content(props) {

    const navigate = useNavigate()
    const [content, setContent] = useState(x)
    const [once, setOnce] = useState('0')

    useEffect(() => {
        setOnce(1)
        async function prepareData() {
            console.log('prepareData')
            const result = await getEditModel(`${props.api}/edit`)
            if (result.ok)
                setContent(result.data)
            else
                setSubmitError(config.text.wrong)
        }
        if (content.aboutRu === '' && once === 1)
            prepareData()
    }, [once, props.api, content])

    const [submitError, setSubmitError] = useState('')

    function getData(e) {
        setContent(prevState => ({ ...prevState, [e.editor.name]: e.editor.getData() }))
    }

    async function submit(e) {
        e.preventDefault()
        const response = await setJsonData(props.api, 0, content)
        if (response.ok)
            if (response.result === r.success)
                navigate('/')
            else
                setSubmitError(config.text.wrong)
        else
            setSubmitError(config.text.wrong)
    }

    return (content.aboutRu === '' ?
        <Progress /> :
        <Box>
            <PageHeader id={0} api={props.api} />
            <Box component='form' onSubmit={submit} margin='auto'>
                {keys.map((text, i) => (
                    <Box key={i} mb={4}>
                        <FormHelperText error>{submitError}</FormHelperText>
                        <InputLabel>{config.text[text]}</InputLabel>
                        <CKEditor name={text} initData={content[text]} onChange={getData} />
                    </Box>
                ))}
                <SubmitButton pro={'edit'} />
            </Box>
        </Box>
    )
}