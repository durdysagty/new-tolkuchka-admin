import { Backdrop, CircularProgress } from '@mui/material'

export default function Progress() {
    return (
        <Backdrop open>
            <CircularProgress color='inherit' />
        </Backdrop>
    )
}