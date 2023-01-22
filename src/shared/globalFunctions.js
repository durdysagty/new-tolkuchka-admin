export const globalLogout = () => {
    document.cookie = `user={}; max-age=-1`
    document.cookie = `hce={}; max-age=-1`
    localStorage.removeItem("MIT")
}