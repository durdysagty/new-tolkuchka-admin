//#region imports
import { useEffect, useState } from 'react'
import config from './configs/config.json'
import { DataContext } from './configs/dataContext'
import { BrowserRouter, Link as RouterLink, Route, Routes } from 'react-router-dom'
import { AppBar, Box, Button, createTheme, CssBaseline, FormHelperText, styled, TextField, ThemeProvider, Drawer, Toolbar, IconButton, List, ListItemButton, Divider, ListItemIcon, ListItemText, Link } from '@mui/material'
import { AltRoute, Assignment, Badge, BurstMode, CategorySharp, CheckBox, ChevronLeft, ChevronRight, Class, ContentPaste, CurrencyExchange, DesignServices, EventSeat, Home, Label, Menu, QrCode, Receipt, Source, Store } from '@mui/icons-material'
import Employee from './links/Employee'
import Progress from './shared/Progress'
import Position from './links/Position'
import Models from './shared/Models'
import Brand from './links/Brand'
import Line from './links/Line'
import Model from './links/Model'
import Category from './links/Category'
import Type from './links/Type'
import Spec from './links/Spec'
import SpecsValue from './links/SpecsValue'
import Warranty from './links/Warranty'
import Product from './links/Product'
import Slide from './links/Slide'
import Currency from './links/Currency'
import SpecsValueMod from './links/SpecsValueMod'
import Content from './links/Content'
import Supplier from './links/Supplier'
import PurchaseInvoice from './links/PurchaseInvoice'
//#endregion
//#region theming
const drawerWidth = 190

const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
})

const closedMixin = (theme) => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up('sm')]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
})

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
}))

const StyledAppBar = styled(AppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}))

const StyledDrawer = styled(Drawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    ...(open && {
      ...openedMixin(theme),
      '& .MuiDrawer-paper': openedMixin(theme),
    }),
    ...(!open && {
      ...closedMixin(theme),
      '& .MuiDrawer-paper': closedMixin(theme),
    }),
  }),
)

const theme = createTheme(
  {
    palette: {
      primary: {
        main: '#000'
      },
      secondary: {
        main: '#fff'
      }
    },
    typography: {
      fontFamily: 'Gilroy, sans-serif',
      fontSize: 12
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            lineHeight: 1.1
          }
        }
      },
      MuiTypography: {
        defaultProps: {
          lineHeight: 1
        }
      },
      MuiAppBar: {
        variants: [{
          props: { variant: 'black' },
          style: {
            backgroundColor: '#000'
          }
        }]
      },
      MuiLink: {
        defaultProps: {
          underline: 'none',
          color: 'inherit'
        }
      },
      MuiTextField: {
        defaultProps: {
          variant: 'standard',
          color: 'primary',
          fullWidth: true,
          sx: {
            marginY: 1
          }
        }
      },
      MuiInputBase: {
        styleOverrides: {
          input: {
            padding: 0.5
          }
        }
      },
      MuiAccordion: {
        styleOverrides: {
          root: {
            position: 'unset',
            boxShadow: 'none',
            "&.Mui-expanded": {
              margin: 0
            }
          }
        }
      },
      MuiAccordionSummary: {
        styleOverrides: {
          root: {
            //flexDirection: 'row-reverse',
            padding: 0,
            minHeight: 0,
            "&.Mui-expanded": {
              minHeight: 0
            },
            "&.Mui-focusVisible": {
              backgroundColor: 'inherit'
            }
          },
          content: {
            margin: 0,
            "&.Mui-expanded": {
              margin: 0
            }
          }
        }
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            lineHeight: 1,
            padding: '1px 4px'
          }
        }
      },
      MuiCheckbox: {
        styleOverrides: {
          root: {
            padding: 0
          }
        }
      }
    }
  }
)
//#endregion

function App() {
  const [authState, setAuthState] = useState(null)
  const [token, setToken] = useState(null)
  const loginResult = { success: 0, fail: 1 }
  function setCredentials(token) {
    document.cookie = `user={}; max-age=345600; samesite=strict; secure`
    localStorage.setItem('MIT', token)
    setToken(token)
    setAuthState(true)
  }
  function removeCredentials() {
    localStorage.removeItem("MIT")
    //window.location.href = '/'
  }

  const [openDr, setOpenDr] = useState(false)

  function handleDrawerOpen() {
    setOpenDr(true)
  }

  function handleDrawerClose() {
    setOpenDr(false)
  }

  const defaults = {
    authState: authState,
    token: token,
    login: login,
    logout: removeCredentials
  }

  const apis = {
    br: 'brand',
    co: 'content',
    ct: 'category',
    cr: 'currency',
    em: 'employee',
    en: 'entry',
    l: 'login',
    li: 'line',
    ml: 'model',
    po: 'position',
    pi: 'purchaseInvoice',
    pr: 'product',
    sl: 'slide',
    sp: 'spec',
    su: 'supplier',
    sv: 'specsvalue',
    svm: 'specsvaluemod',
    wr: 'warranty',
    tp: 'type'
  }

  // const [cl, setCl] = useState(false)
  useEffect(() => {
    const c = document.cookie
    if (c.includes('user=')) {
      const t = localStorage.getItem("MIT")
      if (t !== null)
        setAuthState(true)
      else
        setAuthState(false)
    }
    else {
      removeCredentials()
      setAuthState(false)
    }

    // setCl(true)
    // async function isLogged() {
    //   console.log('isLogged')
    //   const c = document.cookie
    //   if (c.includes('user=')) {
    //     console.log('afterLogged')
    //     try {
    //       const response = await fetch(`${config.apibase}${apis.l}`, {
    //         method: 'GET',
    //         credentials: 'include'
    //       })
    //       if (response.ok) {
    //         const loginResponse = await response.json()
    //         if (loginResponse.result === loginResult.success)
    //           setCredentials(loginResponse.text, loginResponse.data)
    //         else
    //           removeCredentials()
    //       }
    //       else
    //         removeCredentials()
    //     }
    //     catch {
    //       removeCredentials()
    //     }
    //   }
    //   else
    //     setAuthState(false)
    // }
    // if (cl === true)
    //   isLogged()
    // }, [cl, apis.l, loginResult.success])
  }, [authState])

  const [loginError, setLoginError] = useState('')

  async function login(login, password) {
    const loginRequest = {
      login: login,
      password: password
    }
    try {
      const response = await fetch(`${config.apibase}${apis.l}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(loginRequest)
      })
      if (response.ok) {
        const loginResponse = await response.json()
        if (loginResponse.result === loginResult.success) {
          setCredentials(loginResponse.data)
        }
        else {
          setLoginError(config.text.loginError)
        }
      }
      else {
        setLoginError(config.text.wrong)
      }
    }
    catch {
      setLoginError(config.text.wrong)
    }
  }

  const s = {
    log: '',
    password: ''
  }

  const [admin, setAdmin] = useState(s)
  const [validation, setValidation] = useState(s)
  const [logError, setLogError] = useState(false)

  function handleChange(e) {
    e.stopPropagation()
    setAdmin(prevState => ({ ...prevState, [e.target.name]: e.target.value }))
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
        [e.target.name]: 'Это поле не должно быть пустым!'
      }))
    setLogError(true)
  }

  async function submit(e) {
    e.preventDefault()
    login(admin.log, admin.password)
  }

  const links = {
    types: [<DesignServices />, <Models models={config.text.types} api={apis.tp} pro={true} />],
    'type/:pro/:id': [null, <Type api={apis.tp} />],
    categories: [<CategorySharp />, <Models models={config.text.categories} api={apis.ct} pro={true} />],
    'category/:pro/:id': [null, <Category api={apis.ct} />],
    brands: [<Label />, <Models models={config.text.brands} api={apis.br} pro={true} />],
    'brand/:pro/:id': [null, <Brand api={apis.br} />],
    lines: [<Class />, <Models models={config.text.lines} api={apis.li} pro={true} />],
    'line/:pro/:id': [null, <Line api={apis.li} dataFrom={apis.br} />],
    models: [<AltRoute />, <Models models={config.text.models} api={apis.ml} pro={true} />],
    'model/:pro/:id': [null, <Model api={apis.ml} dataFrom={[apis.br, apis.li, apis.sp]} />],
    specs: [<Assignment />, <Models models={config.text.specs} api={apis.sp} api2={`${apis.sv}s`} pro={true} />],
    'spec/:pro/:id': [null, <Spec api={apis.sp} />],
    'specsvalues/spec/:parentId/:name': [null, <Models models={config.text.specsvalues} api={apis.sv} addapi={apis.sp} api2={`${apis.svm}s`} pro={true} />],
    'specsvalue/:pro/:id/:parId/:name': [null, <SpecsValue api={apis.sv} dataFrom={apis.sp} />],
    'specsvaluemods/specsvalue/:parentId/:name': [null, <Models models={config.text.specsvaluemods} api={apis.svm} addapi={apis.sv} pro={true} />],
    'specsvaluemod/:pro/:id/:parId/:name': [null, <SpecsValueMod api={apis.svm} />],
    products: [<QrCode />, <Models models={config.text.products} api={apis.pr} pro={true} />],
    'product/:pro/:id/': [null, <Product api={apis.pr} dataFrom={[apis.ct, apis.tp, apis.br, apis.li, apis.ml, apis.wr, apis.sp]} />],
    warranties: [<CheckBox />, <Models models={config.text.warranties} api={apis.wr} pro={true} />],
    'warranty/:pro/:id': [null, <Warranty api={apis.wr} />],
    currencies: [<CurrencyExchange />, <Models models={config.text.currencies} api={apis.cr} pro={true} />],
    'currency/:pro/:id': [null, <Currency api={apis.cr} />],
    slides: [<BurstMode />, <Models models={config.text.slides} api={apis.sl} pro={true} />],
    'slide/:pro/:id': [null, <Slide api={apis.sl} />],
    suppliers: [<Store />, <Models models={config.text.suppliers} api={apis.su} pro={true} />],
    'supplier/:pro/:id': [null, <Supplier api={apis.su} />],
    purchaseInvoices: [<Receipt />, <Models models={config.text.purchaseInvoices} api={apis.pi} />],
    'purchaseInvoice/:pro/:id': [null, <PurchaseInvoice api={apis.pi} addapi={apis.pr} dataFrom={[apis.cr, apis.su]} />],
    employees: [<Badge />, <Models models={config.text.employees} api={apis.em} />],
    'employee/:pro/:id': [null, <Employee api={apis.em} dataFrom={apis.po} />],
    positions: [<EventSeat />, <Models models={config.text.positions} api={apis.po} pro={true} />],
    'position/:pro/:id': [null, <Position api={apis.po} />],
    content: [<Source />, <Content api={apis.co} />],
    entries: [<ContentPaste />, <Models models={config.text.entries} api={apis.en} />],
  }

  return (
    <DataContext.Provider value={defaults}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {authState === null ?
          <Progress /> :
          authState === false ?
            <Box sx={config.centerBox}>
              <Box>
                <Box component='form' onSubmit={submit} onInvalid={invalid} sx={{ maxWidth: 450 }} margin='auto' >
                  <FormHelperText error>{loginError}</FormHelperText>
                  {Object.keys(s).map((text) => (
                    <TextField type={text === 'password' ? text : 'text'} label={config.text[text]} name={text} onChange={handleChange} value={admin[text]} key={text} required helperText={logError ? validation[text] : ''} error={logError && validation[text] !== '' ? true : false} />
                  ))}
                  <Box textAlign='end' marginTop={3}>
                    <Button type='submit' variant='contained'>Войти</Button>
                  </Box>
                </Box >
              </Box>
            </Box> :
            <Box sx={{ display: 'flex' }}>
              <BrowserRouter>
                <StyledAppBar position='fixed' open={openDr}>
                  <Toolbar>
                    <IconButton color='inherit' aria-label='open drawer' onClick={handleDrawerOpen} edge='start' sx={{ marginRight: 5, ...(openDr && { display: 'none' }), }}>
                      <Menu />
                    </IconButton>
                    <IconButton color='secondary'>
                      <Link to='/' component={RouterLink} height={24} >
                        <Home />
                      </Link>
                    </IconButton>
                  </Toolbar>
                </StyledAppBar>
                <StyledDrawer variant='permanent' open={openDr}>
                  <DrawerHeader>
                    <IconButton onClick={handleDrawerClose}>
                      {theme.direction === 'rtl' ? <ChevronRight /> : <ChevronLeft />}
                    </IconButton>
                  </DrawerHeader>
                  <Divider />
                  <List>
                    {Object.keys(links).map(l => (
                      links[l][0] === null ?
                        null :
                        <Link key={l} to={`${l}`} component={RouterLink} >
                          <ListItemButton sx={{ inHeight: 8, justifyContent: openDr ? 'initial' : 'center', px: 2.5, }}>
                            <ListItemIcon sx={{ minWidth: 0, r: openDr ? 3 : 'auto', justifyContent: 'center', }}>
                              {links[l][0]}
                            </ListItemIcon>
                            <ListItemText primary={config.text[l]} sx={{ opacity: openDr ? 1 : 0, marginLeft: openDr ? 2 : 0 }} />
                          </ListItemButton>
                        </Link>
                    ))}
                  </List>
                </StyledDrawer>
                <Box component='main' sx={{ flexGrow: 1, p: 3 }}>
                  <DrawerHeader />
                  <Routes>
                    <Route path='/' element={null} />
                    {Object.keys(links).map(l => (
                      <Route key={l} path={l} element={links[l][1]} />
                    ))}
                  </Routes>
                </Box>
              </BrowserRouter>
            </Box>
        }
      </ThemeProvider>
    </DataContext.Provider>
  )
}

export default App
