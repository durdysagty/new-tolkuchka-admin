//#region imports
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import config from '../configs/config.json'
import PageHeader from '../shared/PageHeader'
import { Accordion, AccordionDetails, AccordionSummary, Box, Checkbox, FormHelperText, InputLabel, Table, TableBody, TableCell, TableRow, TextField, Typography } from '@mui/material'
import { getData, getEditModel } from '../shared/getData'
import { setFormData } from '../shared/setData'
import Progress from '../shared/Progress'
import AccordionList from '../shared/AccordionList'
import { r } from '../shared/Result'
import ListMany from '../shared/ListMany'
import SubmitButton from '../shared/SubmitButton'
import { ExpandMore } from '@mui/icons-material'
import { wait } from '@testing-library/user-event/dist/utils'
import AutorenewRotate from '../shared/AutorenewRotate'
//#endregion
const x = {
    name: '',
    categoryId: '',
    typeId: '',
    brandId: '',
    lineId: '',
    warrantyId: '',
    descRu: '',
    descEn: '',
    descTm: ''
}
const keys = Object.keys(x)

export default function Model(props) {

    //#region states
    const { id } = useParams()
    const navigate = useNavigate()
    const [model, setModel] = useState(x)
    const [validation, setValidation] = useState(x)
    const [error, setError] = useState(false)
    const [categories, setCategories] = useState(null)
    const [selectCats, setSelectCats] = useState(null)
    const [selectedCat, setSelectedCat] = useState('')
    const [selectStepCats, setSelectStepCats] = useState(null)
    const [stepParents, setStepParents] = useState(null)
    const [toSelect, setToSelect] = useState(true)
    const [types, setTypes] = useState(null)
    const [brands, setBrands] = useState(null)
    const [lines, setLines] = useState(null)
    const [getLines, setGetLines] = useState(false)
    const [specs, setSpecs] = useState(null)
    const [selectedSpecIds, setSelectedSpecIds] = useState([])
    const [selectedSpecs, setSelectedSpecs] = useState(null)
    const [getSelectedSpecs, setGetSelectedSpecs] = useState(false)
    const [warranties, setWarranties] = useState(null)
    const [products, setProducts] = useState(null)
    const [productSpecsValues, setProductSpecsValues] = useState([])
    const [productSpecsValueMods, setProductSpecsValueMods] = useState([])
    const [getAdditional, setGetAdditional] = useState(false)
    const [productsHandled, setProductsHandled] = useState(null)
    const [handleProduct, setHandleProduct] = useState(false)
    const [once, setOnce] = useState(0)
    const [search, setSearch] = useState('')
    const [process, setProcess] = useState(false)
    //#endregion
    const { pro } = useParams()
    useEffect(() => {
        if (once !== 1)
            setOnce(1)
        async function prepareData() {
            console.log('prepareData')
            let result = await getData(`${props.dataFrom[0]}/tree`)
            if (result.ok)
                setCategories(result.data)
            else
                setError(config.text.wrong)
            result = await getData(props.dataFrom[1])
            if (result.ok)
                setTypes(result.data.models)
            else
                setError(config.text.wrong)
            result = await getData(props.dataFrom[2])
            if (result.ok)
                setBrands(result.data.models)
            else
                setError(config.text.wrong)
            result = await getData(props.dataFrom[4])
            if (result.ok)
                setWarranties(result.data.models)
            else
                setError(config.text.wrong)
            result = await getData(props.dataFrom[5])
            if (result.ok)
                setSpecs(result.data.models)
            else
                setError(config.text.wrong)
            if (id !== '0') {
                result = await getData(`${props.dataFrom[0]}/modeladlinks/${id}`)
                if (result.ok)
                    setStepParents(result.data)
                else
                    setError(config.text.wrong)
                result = await getData(`${props.api}/specs/${id}`)
                if (result.ok)
                    setSelectedSpecIds(result.data)
                else
                    setError(config.text.wrong)
                result = await getData(props.dataFrom[6], null, { [props.api]: id })
                if (result.ok)
                    setProducts(result.data)
                else
                    setError(config.text.wrong)
                result = await getData(`${props.api}/specvalues/${id}`)
                if (result.ok)
                    setProductSpecsValues(result.data)
                else
                    setSubmitError(config.text.wrong)
                result = await getData(`${props.api}/specvaluemods/${id}`)
                if (result.ok)
                    setProductSpecsValueMods(result.data)
                result = await getEditModel(props.api, id)
                if (result.ok) {
                    setModel(result.data)
                    setGetAdditional(true)
                }
                else
                    setSubmitError(config.text.wrong)
            }
            else
                if (stepParents === null)
                    setStepParents([])
        }
        async function additionalData() {
            if (getAdditional)
                setGetAdditional(false)
            if (getLines || getAdditional) {
                setGetLines(false)
                console.log('getLines')
                let result = await getData(`${props.dataFrom[3]}`, null, { [props.dataFrom[2]]: model.brandId })
                if (result.ok)
                    setLines(result.data.models)
                else
                    setError(config.text.wrong)
            }
            if (pro === "edt" && (getSelectedSpecs || getAdditional)) {
                console.log('getSelectedSpecs')
                setGetSelectedSpecs(false)
                let ids = selectedSpecIds.map(s => parseInt(s[0]))
                if (selectedSpecs !== null)
                    ids = ids.filter(s => !selectedSpecs.some(x => x.id === s))
                if (ids.length > 0) {
                    const result = await getData(`${props.dataFrom[5]}/value`, null, { [props.dataFrom[5]]: JSON.stringify(ids) })
                    if (result.ok) {
                        if (selectedSpecs !== null) {
                            const array = selectedSpecs.concat(result.data)
                            setSelectedSpecs(array)
                        }
                        else
                            setSelectedSpecs(result.data)
                    }
                    else
                        setError(config.text.wrong)
                }
                //to remove productSpecsValues that not included any on selectedSpecs list
                if (productSpecsValues.length > 0 && selectedSpecs !== null) {
                    const correctedProductSpecsValues = productSpecsValues.filter(psv => selectedSpecs.filter(psv => selectedSpecIds.some(ss => ss[0] === parseInt(psv.id))).some(ss => ss.list.some(l => l.id === parseInt(psv.id))))
                    setProductSpecsValues(correctedProductSpecsValues)
                }
                setHandleProduct(true)
            }
        }
        function selectCategories(categories, stepParent) {
            return categories.map(c => {
                if (c !== null) {
                    const id = stepParent ? `catStep${c.id}` : `cat${c.id}`
                    if (!stepParent && String(model.categoryId) === String(c.id))
                        setSelectedCat(c.name)
                    const checkBox = (stepParent && c.id === parseInt(model.categoryId)) || c.level < 2 || c.list.length > 0 ? null : <Checkbox checked={stepParent ? stepParents.includes(String(c.id)) ? true : false : String(model.categoryId) === String(c.id) ? true : false} onClick={e => e.stopPropagation()} onChange={stepParent ? e => handleCheckStep(e) : e => handleCheck(e, c)} name={keys[1]} value={c.id} />
                    if (c.list.length > 0) {
                        const tree = selectCategories(c.list, stepParent)
                        return <Accordion key={c.id}>
                            <AccordionSummary expandIcon={<ExpandMore />} aria-controls={id} id={`par${id}`} sx={{ display: 'inline-flex' }}>
                                <Typography>
                                    {checkBox}
                                    {c.name}
                                </Typography>
                            </AccordionSummary>
                            <AccordionDetails id={id}>
                                {tree}
                            </AccordionDetails>
                        </Accordion>
                    }
                    else {
                        return <Typography key={c.id} sx={{ display: 'flex', alignItems: 'center' }}>
                            {checkBox}
                            <span>{c.name}</span>
                        </Typography>
                    }
                }
                else
                    return null
            })
        }
        function handleCheck(e) {
            if (e.target.checked) {
                setModel(prevState => ({ ...prevState, [e.target.name]: e.target.value }))
                setValidation(prevState => ({
                    ...prevState,
                    [e.target.name]: ''
                }))
                setToSelect(true)
            }
        }
        function handleCheckStep(e) {
            const array = stepParents.slice()
            if (e.target.checked)
                array.push(e.target.value)
            else
                array.splice(array.indexOf(e.target.value), 1)
            setStepParents(array)
            setToSelect(true)
        }
        function searchCategories(categories, searchedCategories) {
            console.log('searchCategories')
            categories.forEach(c => {
                if (c.name.toLowerCase().includes(search.toLowerCase()))
                    searchedCategories.push(c)
                else if (c.list.length > 0)
                    searchCategories(c.list, searchedCategories)
            })
            return searchedCategories
        }
        async function updateSelectedSpecs() {
            let ids = selectedSpecIds.map(s => parseInt(s[0]))
            if (ids.length > 0) {
                const result = await getData(`${props.dataFrom[5]}/value`, null, { [props.dataFrom[5]]: JSON.stringify(ids) })
                if (result.ok)
                    setSelectedSpecs(result.data)
                else
                    setError(config.text.wrong)
            }
            setHandleProduct(true)
        }
        function handleProducts() {
            console.log('handleProducts')
            const specs = selectedSpecs.filter(psv => selectedSpecIds.some(ss => parseInt(ss[0]) === parseInt(psv.id)))
            const prs = <Box>
                <Box display='flex'>
                    <InputLabel>{config.text.products}</InputLabel>
                    <AutorenewRotate update={updateSelectedSpecs} />
                </Box>
                {products.models.map(p => {
                    return <Box key={p.id} mt={3}>
                        <Typography mb={1}>{p.name}</Typography>
                        {<Box mb={2}>
                            <Table size='small'>
                                <TableBody>
                                    {specs.map((s, i) => <TableRow key={i}>
                                        <TableCell>
                                            {s.name}
                                        </TableCell>
                                        <TableCell>
                                            <AccordionList level={1} name='productSpecsValues' name2='productSpecsValueMods' tableCell={true} list={s.list} checklist={productSpecsValueMods.filter(x => x.productId === p.id)} handleChange={handleSpecs} linkId={p.id} accId={`${i}x`} dtlId={`${i}s`} id={id !== '0' ? s.list.map(x => x.id).find((e) => {
                                                return productSpecsValues.filter(x => x.productId === p.id).map(x => x.id).includes(String(e))
                                            }) : undefined} />
                                        </TableCell>
                                    </TableRow>)}
                                </TableBody>
                            </Table>
                        </Box>}
                    </Box>
                })}
            </Box>
            setProductsHandled(prs)
            setHandleProduct(false)
        }
        function handleSpecs(e, id, parentId, productId) {
            if (e.target.name === 'productSpecsValues') {
                const array = productSpecsValues.slice()
                const psv = {
                    id: e.target.value,
                    productId: productId
                }
                if (e.target.checked) {
                    array.push(psv)
                    //if we have other productSpecsValue of this Spec then remove
                    const removePsv = array.find(e => e.id === String(id) && e.productId === psv.productId)
                    if (removePsv !== undefined) {
                        const i = array.indexOf(removePsv)
                        array.splice(i, 1)
                    }
                    const array2 = productSpecsValueMods.slice()
                    const removePsvm = array2.find(e => parseInt(e.parentId) === parseInt(id) && e.productId === psv.productId)
                    if (removePsvm !== undefined) {
                        const i = array2.indexOf(removePsvm)
                        array2.splice(i, 1)
                        setProductSpecsValueMods(array2)
                    }
                }
                else {
                    const removePsv = array.find(e => e.id === psv.id && e.productId === psv.productId)
                    const i = array.indexOf(removePsv)
                    array.splice(i, 1)
                    const array2 = productSpecsValueMods.slice()
                    const removePsvm = array2.find(e => parseInt(e.parentId) === parseInt(psv.id) && e.productId === psv.productId)
                    if (removePsvm !== undefined) {
                        const i = array2.indexOf(removePsvm)
                        array2.splice(i, 1)
                        setProductSpecsValueMods(array2)
                    }
                }
                //this used to remove productSpecsValueMod if exist
                // if (id !== undefined && e.target.value !== String(id)) {
                //     const array2 = productSpecsValueMods.slice()
                //     const removePsvm = array2.find(a => a.parentId === id && a.productId === productId)
                //     if (removePsvm !== undefined) {
                //         const i = array2.indexOf(removePsvm)
                //         array2.splice(i, 1)
                //         setProductSpecsValueMods(array2)
                //     }
                // }
                setProductSpecsValues(array)
            }
            else {
                const array = productSpecsValueMods.slice()
                const psvm = {
                    id: e.target.value,
                    productId: productId,
                    parentId: parentId
                }
                if (e.target.checked) {
                    array.push(psvm)
                    const removePsvm = array.find(e => e.id === String(id) && e.productId === psvm.productId)
                    if (removePsvm !== undefined) {
                        const i = array.indexOf(removePsvm)
                        array.splice(i, 1)
                    }
                }
                else {
                    const i = array.indexOf(array.find(a => a.id === e.target.value && a.productId === productId))
                    array.splice(i, 1)
                }
                setProductSpecsValueMods(array)
            }
            setHandleProduct(true)
        }
        if (categories === null && once === 1)
            prepareData()
        else if (((id !== '0' && model.id !== '0' && model.id !== undefined && toSelect) || (id === '0' && toSelect)) && (categories !== null && stepParents !== null)) {
            setToSelect(false)
            let list = null
            if (search === '')
                list = categories
            else {
                let searchedCategories = []
                searchCategories(categories, searchedCategories)
                list = searchedCategories
            }
            const sc1 = selectCategories(list, false)
            const sc2 = selectCategories(list, true)
            setSelectCats(sc1)
            setSelectStepCats(sc2)
        }
        if ((model.brandId !== '' && once === 1) || getSelectedSpecs)
            additionalData()
        if (handleProduct)
            handleProducts()
        // console.log(products)
        // console.log(selectedSpecs)
        // console.log(selectedSpecIds)
        // console.log(productSpecsValues)
        // console.log(productSpecsValueMods)
    }, [once, props.api, props.dataFrom, brands, categories, id, model, model.brandId, stepParents, model.categoryId, toSelect, selectedSpecIds, getAdditional, getLines, search, products, productSpecsValues, productSpecsValueMods, selectedSpecs, getSelectedSpecs, handleProduct, pro, process])
    //#region function

    function handleChange(e) {
        setModel(prevState => ({ ...prevState, [e.target.name]: e.target.value }))
        setValidation(prevState => ({
            ...prevState,
            [e.target.name]: ''
        }))
        if (e.target.name === 'brandId') {
            setModel(prevState => ({ ...prevState, lineId: '' }))
            if (e.target.checked) {
                setGetLines(true)
            }
            if (!e.target.checked) {
                setLines(null)
            }
        }
    }

    function handleSelectedSpecIds(ids) {
        setSelectedSpecIds(ids)
        setGetSelectedSpecs(true)
    }

    function invalid(e) {
        e.preventDefault()
        setValidation(prevState => ({
            ...prevState,
            [e.target.name]: config.text.empty
        }))
        setError(true)
    }

    let searchTimeOut = null
    function changeSearch(e) {
        setSearch(e.target.value)
        // setToSelect(true)
        if (searchTimeOut !== null)
            clearTimeout(searchTimeOut)
        searchTimeOut = setTimeout(() => {
            setToSelect(true)
        }, 2000)
    }
    const [submitError, setSubmitError] = useState('')

    //#endregion
    async function submit(e) {
        e.preventDefault()
        setProcess(true)
        await wait(0)
        if (pro === "edt" && selectedSpecIds.length * products.models.length > productSpecsValues.length) {
            setSubmitError(config.text.notAllSpecs)
            setProcess(false)
            return
        }
        let i = id
        if (pro === 'sim') {
            delete model.id
            i = '0'
        }
        const response = await setFormData(props.api, i, model, null, selectedSpecIds.length > 0 ? {
            adLinks: stepParents.length > 0 ? stepParents : null,
            specs: selectedSpecIds,
            productSpecsValues: pro === "edt" ? productSpecsValues.map(x => {
                return [x.productId, parseInt(x.id)]
            }) : null,
            productSpecsValueMods: pro === "edt" ? productSpecsValueMods.map(x => {
                return [x.productId, parseInt(x.id)]
            }) : null
        } : null)
        if (response.ok)
            if (response.result === r.success)
                navigate(-1)
            else {
                if (pro === "edt")
                    setSubmitError(config.text.alreadyModel)
                else
                    setSubmitError(config.text.already2)
            }
        else
            setSubmitError(config.text.wrong)
        setProcess(false)
    }

    return ((id !== '0' && model.brandId === '') || specs === null || process ?
        <Progress /> :
        <Box>
            <PageHeader id={id} pro={pro} api={props.api} />
            <Box component='form' onSubmit={submit} onInvalid={invalid} margin='auto' >
                <FormHelperText error>{submitError}</FormHelperText>
                <TextField type='text' label={config.text.name} name={keys[0]} onChange={handleChange} value={model.name} required helperText={error ? validation.name : ''} error={error && validation.name !== '' ? true : false} />
                <Accordion>
                    <AccordionSummary expandIcon={<ExpandMore />} aria-controls='cats' id='cat'>
                        <TextField type='text' label={config.text.category} name={keys[1]} value={selectedCat} required helperText={error ? validation[keys[1]] : ''} error={error && validation[keys[1]] !== '' ? true : false} />
                    </AccordionSummary>
                    <AccordionDetails id='cats'>
                        <TextField value={search} onChange={changeSearch} />
                        {selectCats}
                        <Typography variant='h6' sx={{ py: 1 }}>
                            {config.text.stepParents}
                        </Typography>
                        {selectStepCats}
                    </AccordionDetails>
                </Accordion>
                <AccordionList list={types} name={keys[2]} handleChange={handleChange} accId='type' dtlId='types' req={true} error={error} validation={validation[keys[2]]} id={model.typeId} />
                <AccordionList list={brands} name={keys[3]} handleChange={handleChange} accId='brand' dtlId='brands' req={true} error={error} validation={validation[keys[3]]} id={id !== '0' ? model.brandId : undefined} />
                <AccordionList list={lines} name={keys[4]} handleChange={handleChange} accId='line' dtlId='lines' req={false} error={error} validation={validation[keys[4]]} id={id !== '0' ? model.lineId : undefined} />
                <AccordionList list={warranties} name={keys[5]} handleChange={handleChange} accId='warranty' dtlId='warranties' req={true} error={error} validation={validation[keys[5]]} id={model.warrantyId} />
                <ListMany list={specs} name='specs' selectedSpecs={selectedSpecIds} setIds={handleSelectedSpecIds} mainText='specs' secondText='isNameUse' req={false} checkList={selectedSpecIds} />
                {keys.slice(-3).map((text, i) => (
                    <TextField key={i} type='text' label={config.text[text]} name={text} onChange={handleChange} value={model[text]} required helperText={error ? validation[text] : ''} error={error && validation[text] !== '' ? true : false} multiline />
                ))}
                {productsHandled}
                <SubmitButton id={id} pro={pro} />
            </Box >
        </Box>
    )
}