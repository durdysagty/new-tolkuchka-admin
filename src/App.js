//#region imports
import { useEffect, useState } from 'react'
import config from './configs/config.json'
import { globalLogout } from './shared/globalFunctions'
import { BrowserRouter, Link as RouterLink, Route, Routes } from 'react-router-dom'
import { AppBar, Box, Button, createTheme, CssBaseline, FormHelperText, styled, TextField, ThemeProvider, Drawer, Toolbar, IconButton, List, ListItemButton, Divider, ListItemIcon, ListItemText, Link } from '@mui/material'
import { AltRoute, Assessment, Assignment, Badge, BurstMode, CategorySharp, CheckBox, ChevronLeft, ChevronRight, Class, ContentPaste, CurrencyExchange, DesignServices, EventSeat, Home, Label, Logout, Menu, People, QrCode, Receipt, ReceiptLong, Source, Store, TextRotationAngleup, TextSnippet } from '@mui/icons-material'
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
import Invoice from './links/Invoice'
import InvoicePrint from './links/InvoicePrint'
import InvoiceProcess from './links/InvoiceProcess'
import Report from './links/Report'
import Article from './links/Article'
import Promotion from './links/Promotion'
import User from './links/User'
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
      MuiListItemButton: {
        styleOverrides: {
          root: {
            paddingLeft: 5,
            paddingTop: 2,
            paddingRight: 5,
            paddingBottom: 2
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

const apis = {
  ar: 'article',
  br: 'brand',
  co: 'content',
  ct: 'category',
  cr: 'currency',
  em: 'employee',
  en: 'entry',
  hd: 'heading',
  in: 'invoice',
  ln: 'login',
  li: 'line',
  ml: 'model',
  po: 'position',
  pi: 'purchaseInvoice',
  pr: 'product',
  pn: 'promotion',
  re: 'report',
  sl: 'slide',
  sp: 'spec',
  su: 'supplier',
  sv: 'specsvalue',
  sm: 'specsvaluemod',
  tp: 'type',
  us: 'user',
  wr: 'warranty'
}

function App() {
  const [authState, setAuthState] = useState(null)
  const loginResult = { success: 0, fail: 1 }
  function setCredentials(loginResponse) {
    document.cookie = 'user={}; max-age=604800; samesite=strict; secure'
    document.cookie = `hce=${loginResponse.text}; domain=${config.domain}; max-age=604800; samesite=none; secure`
    localStorage.setItem('MIT', loginResponse.data)
    setAuthState(true)
  }
  function logout() {
    globalLogout()
    setAuthState(false)
  }

  const [openDr, setOpenDr] = useState(false)

  function handleDrawerOpen() {
    setOpenDr(true)
  }

  function handleDrawerClose() {
    setOpenDr(false)
  }


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
      setAuthState(false)
    }
  }, [authState])

  //#region functions
  const [loginError, setLoginError] = useState('')

  async function login(login, password) {
    const loginRequest = {
      login: login,
      password: password
    }
    try {
      const response = await fetch(`${config.apibase}${apis.ln}`, {
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
          setCredentials(loginResponse)
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
  //#endregion
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
    'model/:pro/:id': [null, <Model api={apis.ml} dataFrom={[apis.ct, apis.tp, apis.br, apis.li, apis.wr, apis.sp, apis.pr]} />],
    specs: [<Assignment />, <Models models={config.text.specs} api={apis.sp} api2={`${apis.sv}s`} pro={true} />],
    'spec/:pro/:id': [null, <Spec api={apis.sp} />],
    'specsvalues/spec/:parentId/:name': [null, <Models models={config.text.specsvalues} api={apis.sv} addapi={apis.sp} api2={`${apis.sm}s`} pro={true} />],
    'specsvalue/:pro/:id/:parId/:name': [null, <SpecsValue api={apis.sv} dataFrom={apis.sp} />],
    'specsvaluemods/specsvalue/:parentId/:name': [null, <Models models={config.text.specsvaluemods} api={apis.sm} addapi={apis.sv} pro={true} />],
    'specsvaluemod/:pro/:id/:parId/:name': [null, <SpecsValueMod api={apis.sm} />],
    products: [<QrCode />, <Models models={config.text.products} api={apis.pr} pro={true} />],
    'product/:pro/:id/': [null, <Product api={apis.pr} dataFrom={[apis.ct, apis.tp, apis.br, apis.li, apis.ml, apis.wr, apis.sp]} />],
    promotions: [<TextRotationAngleup />, <Models models={config.text.promotions} api={apis.pn} pro={true} />],
    'promotion/:pro/:id/': [null, <Promotion api={apis.pn} addapi={apis.pr} dataFrom={[]} />],
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
    invoices: [<ReceiptLong />, <Models models={config.text.invoices} api={apis.in} api2='process' api3='print' notAdd={true} listKey='orders' />],
    'invoice/:pro/:id': [null, <Invoice api={apis.in} addapi={apis.pr} dataFrom={[apis.cr]} />],
    'process/invoice/:id': [null, <InvoiceProcess api={apis.in} dataFrom={[apis.pi]} />],
    'print/invoice/:id': [null, <InvoicePrint api={apis.in} />],
    users: [<People />, <Models models={config.text.users} api={apis.us} notAdd={true} notEditable={true} watchable={true} />],
    'user/:id': [null, <User api={apis.us} dataFrom={[apis.in]} />],
    employees: [<Badge />, <Models models={config.text.employees} api={apis.em} />],
    'employee/:pro/:id': [null, <Employee api={apis.em} dataFrom={apis.po} />],
    positions: [<EventSeat />, <Models models={config.text.positions} api={apis.po} pro={true} />],
    'position/:pro/:id': [null, <Position api={apis.po} />],
    content: [<Source />, <Content api={`${apis.co}`} />],
    report: [<Assessment />, <Report api={apis.re} />],
    articles: [<TextSnippet />, <Models models={config.text.articles} api={apis.ar} pro={true} />],
    'article/:pro/:id': [null, <Article api={apis.ar} addapi={apis.hd} />],
    entries: [<ContentPaste />, <Models models={config.text.entries} api={apis.en} notAdd={true} />],
  }

  return (
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
                  <Link to={'/'} component={RouterLink} onClick={logout} >
                    <ListItemButton sx={{ inHeight: 8, justifyContent: openDr ? 'initial' : 'center', px: 2.5, }}>
                      <ListItemIcon sx={{ minWidth: 0, r: openDr ? 3 : 'auto', justifyContent: 'center', }}>
                        <Logout />
                      </ListItemIcon>
                      <ListItemText primary={config.text.exit} sx={{ opacity: openDr ? 1 : 0, marginLeft: openDr ? 2 : 0 }} />
                    </ListItemButton>
                  </Link>
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
  )
}

export default App
