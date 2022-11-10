import { forwardRef, useImperativeHandle, useState } from 'react'
import config from '../configs/config.json'
import { Box, Button, Modal, Typography } from '@mui/material'

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4
}

export const RemoveModal = forwardRef((props, ref) => {

    const [open, setOpen] = useState(false)
    const handleOpen = () => setOpen(true)
    const handleClose = () => setOpen(false)
    useImperativeHandle(
        ref,
        () => ({
            handleOpen() {
                handleOpen()
            },
            handleClose() {
                handleClose()
            }
        }))

    return (
        <Modal open={open} onClose={handleClose} aria-labelledby='removeTitle'>
            <Box sx={style}>
                <Typography id='removeTitle' variant='h6' component='h2'>
                    Вы точно хотите удалить объект?
                </Typography>
                <Box textAlign='end' marginTop={2}>
                    <Button onClick={() => props.delete(true)} variant='contained' sx={{ marginRight: 1 }}>{config.text.yes}</Button>
                    <Button onClick={() => props.delete(false)} variant='contained'>{config.text.no}</Button>
                </Box>
            </Box>
        </Modal>
    )
})