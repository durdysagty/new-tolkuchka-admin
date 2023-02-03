//#region imports
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import config from '../configs/config.json'
import PageHeader from '../shared/PageHeader'
import { Box, FormHelperText, TextField } from '@mui/material'
import { getData, getEditModel } from '../shared/getData'
import { setFormData } from '../shared/setData'
import Progress from '../shared/Progress'
import { r, culture } from '../shared/Result'
import SubmitButton from '../shared/SubmitButton'
import { wait } from '@testing-library/user-event/dist/utils'
import ImageUpload from '../shared/ImageUpload'
import ListSingle from '../shared/ListSingle'
import AddNew from '../shared/AddNew'
//#endregion
const x = {
    name: '',
    text: ''
}
const keys = Object.keys(x)
const newHeading = {
    id: 0,
    name: '',
    language: null
}
const textMaxLength = 4000

export default function Article(props) {
    //#region states
    const { id } = useParams()
    const navigate = useNavigate()
    const [article, setArticle] = useState(x)
    const [language, setLanguage] = useState(null)
    const [langChanged, setLangChanged] = useState(false)
    const [image, setImage] = useState(null)
    const [validation, setValidation] = useState(x)
    const [error, setError] = useState(false)
    const [headings, setHeadings] = useState([])
    const [selectedHeadingIds, setSelectedHeadingIds] = useState([])
    const [deletedHeadingIds, setDeletedHeadingIds] = useState([])
    const [once, setOnce] = useState(0)
    const [process, setProcess] = useState(false)
    //#endregion
    useEffect(() => {
        if (id !== '0') {
            setOnce(1)
            async function prepareData() {
                console.log('prepareData')
                if (id !== '0') {
                    let result = await getData(`${props.api}/${props.addapi}/ids/${id}`)
                    if (result.ok)
                        setSelectedHeadingIds(result.data)
                    else
                        setError(config.text.wrong)
                    result = await getData(`${props.api}/${props.addapi}s/?articleId=${id}`)
                    if (result.ok) {
                        setHeadings(result.data)
                        setLanguage(result.data[0].language)
                    }
                    else
                        setError(config.text.wrong)
                    result = await getEditModel(props.api, id)
                    if (result.ok)
                        setArticle(result.data)
                    else
                        setSubmitError(config.text.wrong)
                }
            }
            if (article.name === '' && once === 1)
                prepareData()
        }
        async function additionalData() {
            console.log('additionalData')
            const result = await getData(`${props.api}/${props.addapi}s/?culture=${language}`)
            if (result.ok)
                setHeadings(result.data)
            else
                setError(config.text.wrong)
            setLangChanged(false)
            newHeading.language = language
        }
        if (language !== null && langChanged) {
            additionalData()
        }
    }, [once, props.api, props.addapi, article.name, language, langChanged, headings, id, selectedHeadingIds, deletedHeadingIds, process])

    //#region functions
    function handleChange(e) {
        if (e.target.name === 'image')
            setImage(e.target.files[0])
        else
            setArticle(prevState => ({ ...prevState, [e.target.name]: e.target.value }))
        setValidation(prevState => ({
            ...prevState,
            [e.target.name]: ''
        }))
        let cyrillics = 0
        let turkmen = 0
        if (e.target.name === 'text' && e.target.value.length > 15) {
            for (let i = 0; i < e.target.value.length; i++) {
                const c = e.target.value.charCodeAt(i)
                if (c > 1024 && c < 1200)
                    cyrillics++
                if ([196, 199, 214, 220, 221, 228, 231, 246, 351, 252, 253, 327, 328, 350, 381, 382].includes(c))
                    turkmen++
                if (cyrillics > 10 || turkmen > 6 || i > 150)
                    break
            }
            if (turkmen > 6) {
                if (language !== culture.tm) {
                    setLanguage(culture.tm)
                    setLangChanged(true)
                }
            }
            else if (cyrillics > 6) {
                if (language !== culture.ru) {
                    setLanguage(culture.ru)
                    setLangChanged(true)
                }
            }
            else {
                if (language !== culture.en) {
                    setLanguage(culture.en)
                    setLangChanged(true)
                }
            }
        }
        // console.log(headings)
        // console.log(deletedHeadingIds)
        // console.log(article.text.length)
        // console.log(JSON.stringify(article.text).length - 2)
    }

    function handleSelectedHeadingIds(ids) {
        setSelectedHeadingIds(ids)
    }

    function addNewHeading(array) {
        setHeadings(array)
        console.log(array)
    }

    function deleteHeading(id, name) {
        if (id !== 0) {
            if (deletedHeadingIds.includes(id)) {
                const array = deletedHeadingIds.slice()
                array.splice(array.indexOf(id), 1)
                setDeletedHeadingIds(array)
            }
            else {
                const array = deletedHeadingIds.slice()
                array.push(id)
                setDeletedHeadingIds(array)
            }
        }
        else {
            const array = headings.slice()
            array.splice(array.indexOf(array.find(el => el.name === name)), 1)
            setHeadings(array)
        }
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
        if (JSON.stringify(article.text).length > textMaxLength) {
            setSubmitError(`${config.text.maxLength}${textMaxLength}`)
            return
        }
        const newHeadings = headings.filter(h => h.id === 0)
        if (selectedHeadingIds.length === 0 && newHeadings.length === 0) {
            setSubmitError(config.text.noHeading)
            return
        }
        for (let i = 0; i < newHeadings.length; i++) {
            newHeadings[i].language = language
        }
        setProcess(true)
        await wait(0)
        let i = id
        if (pro === 'sim')
            i = '0'
        const response = await setFormData(props.api, i, article, image === null ? null : [image], {
            headingsJson: JSON.stringify(newHeadings),
            selectedHeadingIds: selectedHeadingIds,
            deleteHeadingIds: deletedHeadingIds,
            culture: language
        })
        if (response.ok) {
            if (response.result === r.success)
                navigate(-1)
            else if (response.result === r.noConnections)
                setSubmitError(config.text.noHeading)
            else if (response.result === r.deleteError)
                setSubmitError(config.text.deleteHeadingError)
            else
                setSubmitError(config.text.already2)
        }
        else
            setSubmitError(config.text.wrong)
        setProcess(false)
    }

    return ((id !== '0' && article.name === '') || process ?
        <Progress /> :
        <Box>
            <PageHeader id={id} pro={pro} api={props.api} />
            <Box component='form' onSubmit={submit} onInvalid={invalid} margin='auto'>
                <FormHelperText error>{submitError}</FormHelperText>
                {keys.map((text, i) => (
                    <TextField key={i} type='text' label={config.text[text]} name={text} onChange={handleChange} value={article[text]} required helperText={error ? validation[text] : ''} error={error && validation[text] !== '' ? true : false} multiline />
                ))}
                <ImageUpload handleChange={handleChange} id={id} error={error} validation={validation} />
                <ListSingle list={headings} name='headings' setIds={handleSelectedHeadingIds} delete={deleteHeading} mainText='headings' checkList={selectedHeadingIds} deletedList={deletedHeadingIds} />
                {language == null ? null :
                    <AddNew label={'addNewHeading'} newObject={newHeading} objects={headings} setNew={addNewHeading} />
                }
                <SubmitButton id={id} pro={pro} />
            </Box >
        </Box>)
}