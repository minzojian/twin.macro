var babelPluginMacros = require('babel-plugin-macros')
var path = require('path')
var fs = require('fs')
var Module = require('module')
var toPath$1 = require('tailwindcss/lib/util/toPath')
var generateRules = require('tailwindcss/lib/lib/generateRules')
var setupContextUtils = require('tailwindcss/lib/lib/setupContextUtils')
require('tailwindcss/stubs/defaultConfig.stub')
var transformThemeValueRaw = require('tailwindcss/lib/util/transformThemeValue')
var resolveTailwindConfigRaw = require('tailwindcss/lib/util/resolveConfig')
var getAllConfigsRaw = require('tailwindcss/lib/util/getAllConfigs')
var splitAtTopLevelOnly$1 = require('tailwindcss/lib/util/splitAtTopLevelOnly')
var unescapeRaw = require('postcss-selector-parser/dist/util/unesc')
var chalk = require('chalk')
var deepMerge = require('lodash.merge')
var get = require('lodash.get')
var template = require('@babel/template')

function _interopDefaultLegacy(e) {
  return e && typeof e === 'object' && 'default' in e ? e : { default: e }
}

var path__default = /*#__PURE__*/ _interopDefaultLegacy(path)
var fs__default = /*#__PURE__*/ _interopDefaultLegacy(fs)
var Module__default = /*#__PURE__*/ _interopDefaultLegacy(Module)
var transformThemeValueRaw__default = /*#__PURE__*/ _interopDefaultLegacy(
  transformThemeValueRaw
)
var resolveTailwindConfigRaw__default = /*#__PURE__*/ _interopDefaultLegacy(
  resolveTailwindConfigRaw
)
var getAllConfigsRaw__default =
  /*#__PURE__*/ _interopDefaultLegacy(getAllConfigsRaw)
var unescapeRaw__default = /*#__PURE__*/ _interopDefaultLegacy(unescapeRaw)
var chalk__default = /*#__PURE__*/ _interopDefaultLegacy(chalk)
var deepMerge__default = /*#__PURE__*/ _interopDefaultLegacy(deepMerge)
var get__default = /*#__PURE__*/ _interopDefaultLegacy(get)
var template__default = /*#__PURE__*/ _interopDefaultLegacy(template)

function escalade(start, callback) {
  let dir = path.resolve('.', start)
  let tmp,
    stats = fs.statSync(dir)

  if (!stats.isDirectory()) {
    dir = path.dirname(dir)
  }

  while (true) {
    tmp = callback(dir, fs.readdirSync(dir))
    if (tmp) return path.resolve(dir, tmp)
    dir = path.dirname((tmp = dir))
    if (tmp === dir) break
  }
}

function commonjsRequire(target) {
  throw new Error(
    'Could not dynamically require "' +
      target +
      '". Please configure the dynamicRequireTargets option of @rollup/plugin-commonjs appropriately for this require call to behave properly.'
  )
}

const resolveFrom = (fromDir, moduleId, silent) => {
  if (typeof fromDir !== 'string') {
    throw new TypeError(
      `Expected \`fromDir\` to be of type \`string\`, got \`${typeof fromDir}\``
    )
  }

  if (typeof moduleId !== 'string') {
    throw new TypeError(
      `Expected \`moduleId\` to be of type \`string\`, got \`${typeof moduleId}\``
    )
  }

  try {
    fromDir = fs__default['default'].realpathSync(fromDir)
  } catch (err) {
    if (err.code === 'ENOENT') {
      fromDir = path__default['default'].resolve(fromDir)
    } else if (silent) {
      return null
    } else {
      throw err
    }
  }

  const fromFile = path__default['default'].join(fromDir, 'noop.js')

  const resolveFileName = () =>
    Module__default['default']._resolveFilename(moduleId, {
      id: fromFile,
      filename: fromFile,
      paths: Module__default['default']._nodeModulePaths(fromDir),
    })

  if (silent) {
    try {
      return resolveFileName()
    } catch (err) {
      return null
    }
  }

  return resolveFileName()
}

var resolveFrom_1 = (fromDir, moduleId) => resolveFrom(fromDir, moduleId)
var silent = (fromDir, moduleId) => resolveFrom(fromDir, moduleId, true)
resolveFrom_1.silent = silent

const callsites = () => {
  const _prepareStackTrace = Error.prepareStackTrace
  Error.prepareStackTrace = (_, stack) => stack
  const stack = new Error().stack.slice(1)
  Error.prepareStackTrace = _prepareStackTrace
  return stack
}

var callsites_1 = callsites
// TODO: Remove this for the next major release
var _default = callsites
callsites_1.default = _default

var parentModule = filepath => {
  const stacks = callsites_1()

  if (!filepath) {
    return stacks[2].getFileName()
  }

  let seenVal = false

  // Skip the first stack as it's this function
  stacks.shift()

  for (const stack of stacks) {
    const parentFilepath = stack.getFileName()

    if (typeof parentFilepath !== 'string') {
      continue
    }

    if (parentFilepath === filepath) {
      seenVal = true
      continue
    }

    // Skip native modules
    if (parentFilepath === 'module.js') {
      continue
    }

    if (seenVal && parentFilepath !== filepath) {
      return parentFilepath
    }
  }
}

var importFresh = moduleId => {
  if (typeof moduleId !== 'string') {
    throw new TypeError('Expected a string')
  }

  const parentPath = parentModule(__filename)

  const cwd = parentPath
    ? path__default['default'].dirname(parentPath)
    : __dirname
  const filePath = resolveFrom_1(cwd, moduleId)

  const oldModule = require.cache[filePath]
  // Delete itself from module parent
  if (oldModule && oldModule.parent) {
    let i = oldModule.parent.children.length

    while (i--) {
      if (oldModule.parent.children[i].id === filePath) {
        oldModule.parent.children.splice(i, 1)
      }
    }
  }

  delete require.cache[filePath] // Delete module from cache

  const parent = require.cache[parentPath] // If `filePath` and `parentPath` are the same, cache will already be deleted so we won't get a memory leak in next step

  return parent === undefined
    ? commonjsRequire(filePath)
    : parent.require(filePath) // In case cache doesn't have parent, fall back to normal require
}

const TWIN_CONFIG_DEFAULTS = {
  allowStyleProp: false,
  autoCssProp: false,
  config: undefined,
  convertHtmlElementToStyled: false,
  convertStyledDot: false,
  css: {
    import: '',
    from: '',
  },
  dataCsProp: false,
  dataTwProp: false,
  debug: false,
  disableCsProp: true,
  disableShortCss: true,
  global: {
    import: '',
    from: '',
  },
  hasLogColors: true,
  includeClassNames: false,
  moveTwPropToStyled: false,
  moveKeyframesToGlobalStyles: false,
  preset: undefined,
  sassyPseudo: false,
  stitchesConfig: undefined,
  styled: {
    import: '',
    from: '',
  },
} // Defaults for different css-in-js libraries

const configDefaultsGoober = {
  sassyPseudo: true,
} // Sets selectors like hover to &:hover

const configDefaultsStitches = {
  sassyPseudo: true,
  convertStyledDot: true,
  moveTwPropToStyled: true,
  convertHtmlElementToStyled: true,
  stitchesConfig: undefined,
  moveKeyframesToGlobalStyles: true, // Stitches doesn't support inline @keyframes
}

function configDefaultsTwin({ isGoober, isStitches, isDev }) {
  return {
    ...TWIN_CONFIG_DEFAULTS,
    ...(isGoober && configDefaultsGoober),
    ...(isStitches && configDefaultsStitches),
    dataTwProp: isDev,
    dataCsProp: isDev,
  }
}

function isBoolean(value) {
  return typeof value === 'boolean'
}

const allowedPresets = ['styled-components', 'emotion', 'goober', 'stitches']
const configTwinValidators = {
  preset: [
    value =>
      value === undefined ||
      (typeof value === 'string' && allowedPresets.includes(value)),
    `The config “preset” can only be:\n${allowedPresets
      .map(p => `'${p}'`)
      .join(', ')}`,
  ],
  allowStyleProp: [
    isBoolean,
    'The config “allowStyleProp” can only be a boolean',
  ],
  autoCssProp: [
    value => !value,
    'The “autoCssProp” feature has been removed from twin.macro@2.8.2+\nThis means the css prop must be added by styled-components instead.\nSetup info at https://twinredirect.page.link/auto-css-prop\n\nRemove the “autoCssProp” item from your config to avoid this message.',
  ],
  disableColorVariables: [
    value => !value,
    'The disableColorVariables feature has been removed from twin.macro@3+\n\nRemove the disableColorVariables item from your config to avoid this message.',
  ],
  sassyPseudo: [isBoolean, 'The config “sassyPseudo” can only be a boolean'],
  dataTwProp: [
    value => isBoolean(value) || value === 'all',
    'The config “dataTwProp” can only be true, false or "all"',
  ],
  dataCsProp: [
    value => isBoolean(value) || value === 'all',
    'The config “dataCsProp” can only be true, false or "all"',
  ],
  includeClassNames: [
    isBoolean,
    'The config “includeClassNames” can only be a boolean',
  ],
  disableCsProp: [
    isBoolean,
    'The config “disableCsProp” can only be a boolean',
  ],
  convertStyledDot: [
    isBoolean,
    'The config “convertStyledDot” can only be a boolean',
  ],
  moveTwPropToStyled: [
    isBoolean,
    'The config “moveTwPropToStyled” can only be a boolean',
  ],
  convertHtmlElementToStyled: [
    isBoolean,
    'The config “convertHtmlElementToStyled” can only be a boolean',
  ],
}

function toArray(array) {
  if (Array.isArray(array)) return array
  return [array]
}

const AMPERSAND_AFTER = /&(.+)/g
const AMPERSAND = /&/g

function stripAmpersands(string) {
  return typeof string === 'string'
    ? string.replace(AMPERSAND, '').trim()
    : string
}

const EXTRA_VARIANTS = [
  ['all', '& *'],
  ['all-child', '& > *'],
  ['sibling', '& ~ *'],
  ['hocus', ['&:hover', '&:focus']],
  'link',
  'read-write',
  ['svg', '& svg'],
  ['even-of-type', '&:nth-of-type(even)'],
  ['odd-of-type', '&:nth-of-type(odd)'],
]
const EXTRA_NOT_VARIANTS = [
  // Positional
  ['first', '&:first-child'],
  ['last', '&:last-child'],
  ['only', '&:only-child'],
  ['odd', '&:nth-child(odd)'],
  ['even', '&:nth-child(even)'],
  'first-of-type',
  'last-of-type',
  'only-of-type', // State
  'target',
  ['open', '&[open]'], // Forms
  'default',
  'checked',
  'indeterminate',
  'placeholder-shown',
  'autofill',
  'optional',
  'required',
  'valid',
  'invalid',
  'in-range',
  'out-of-range',
  'read-only', // Content
  'empty', // Interactive
  'focus-within',
  'hover',
  'focus',
  'focus-visible',
  'active',
  'enabled',
  'disabled',
]

function defaultVariants({ config, addVariant }) {
  const extraVariants = EXTRA_VARIANTS.flatMap(v => {
    let [name, selector] = toArray(v)
    selector = selector || `&:${String(name)}`
    const variant = [name, selector] // Create a :not() version of the selectors above

    const notVariant = [
      `not-${String(name)}`,
      toArray(selector).map(s => `&:not(${stripAmpersands(s)})`),
    ]
    return [variant, notVariant]
  }) // Create :not() versions of these selectors

  const notPseudoVariants = EXTRA_NOT_VARIANTS.map(v => {
    const [name, selector] = toArray(v)
    const notConfig = [
      `not-${name}`,
      toArray(selector || `&:${name}`).map(s => `&:not(${stripAmpersands(s)})`),
    ]
    return notConfig
  })
  const variants = [...extraVariants, ...notPseudoVariants]

  for (const [name, selector] of variants) {
    addVariant(name, toArray(selector))
  }

  for (const [name, selector] of variants) {
    const groupSelector = toArray(selector).map(s =>
      s.replace(AMPERSAND_AFTER, ':merge(.group)$1 &')
    )
    addVariant(`group-${name}`, groupSelector)
  }

  for (const [name, selector] of variants) {
    const peerSelector = toArray(selector).map(s =>
      s.replace(AMPERSAND_AFTER, ':merge(.peer)$1 ~ &')
    )
    addVariant(`peer-${name}`, peerSelector)
  } // https://developer.mozilla.org/en-US/docs/Web/CSS/@media/any-pointer

  addVariant('any-pointer-none', '@media (any-pointer: none)')
  addVariant('any-pointer-fine', '@media (any-pointer: fine)')
  addVariant('any-pointer-coarse', '@media (any-pointer: coarse)') // https://developer.mozilla.org/en-US/docs/Web/CSS/@media/pointer

  addVariant('pointer-none', '@media (pointer: none)')
  addVariant('pointer-fine', '@media (pointer: fine)')
  addVariant('pointer-coarse', '@media (pointer: coarse)') // https://developer.mozilla.org/en-US/docs/Web/CSS/@media/any-hover

  addVariant('any-hover-none', '@media (any-hover: none)')
  addVariant('any-hover', '@media (any-hover: hover)') // https://developer.mozilla.org/en-US/docs/Web/CSS/@media/hover

  addVariant('can-hover', '@media (hover: hover)')
  addVariant('cant-hover', '@media (hover: none)')
  addVariant('screen', '@media screen') // Light mode
  // eslint-disable-next-line unicorn/prefer-spread

  let [mode, className = '.light'] = [].concat(config('lightMode', 'media')) // @ts-expect-error Source types don't include boolean

  if (mode === false) mode = 'media'

  if (mode === 'class') {
    addVariant('light', `${className} &`)
  } else if (mode === 'media') {
    addVariant('light', '@media (prefers-color-scheme: light)')
  } // eslint-disable-next-line unicorn/prefer-spread
  ;[mode, className = '.light'] = [].concat(config('lightMode', 'media'))

  if (mode === 'class') {
    addVariant('light', `${className} &`)
  } else if (mode === 'media') {
    addVariant('light', '@media (prefers-color-scheme: light)')
  }
}

const defaultTailwindConfig = {
  presets: [
    {
      content: [''],
      theme: {
        extend: {
          content: {
            DEFAULT: '',
          },
          zIndex: {
            1: '1',
          }, // Add a handy small zIndex (`z-1` / `-z-1`)
        },
      },
      plugins: [defaultVariants], // Add extra variants
    },
  ],
}

// @ts-expect-error Types added below
const toPath = toPath$1.toPath
const createContext = setupContextUtils.createContext
const resolveMatches = generateRules.resolveMatches
const transformThemeValue = transformThemeValueRaw__default['default']
const resolveTailwindConfig = resolveTailwindConfigRaw__default['default']
const getAllConfigs = getAllConfigsRaw__default['default']
const splitAtTopLevelOnly = splitAtTopLevelOnly$1.splitAtTopLevelOnly
const unescape = unescapeRaw__default['default']

function isObject(value) {
  // eslint-disable-next-line eqeqeq, no-eq-null
  return value != null && typeof value === 'object' && !Array.isArray(value)
}

const colors$1 = {
  error: chalk__default['default'].hex('#ff8383'),
  errorLight: chalk__default['default'].hex('#ffd3d3'),
  warn: chalk__default['default'].yellowBright,
  success: chalk__default['default'].greenBright,
  highlight: chalk__default['default'].yellowBright,
  subdued: chalk__default['default'].hex('#999'),
}

function makeColor$1(hasColor) {
  return (message, type = 'error') => {
    if (!hasColor) return message
    return colors$1[type](message)
  }
}

function spaced(string) {
  return `\n\n${string}\n`
}

function warning(string) {
  return colors$1.error(`✕ ${string}`)
}

function logGeneralError(error) {
  return Array.isArray(error)
    ? spaced(
        `${warning(
          typeof error[0] === 'function' ? error[0](colors$1) : error[0]
        )}\n\n${error[1]}`
      )
    : spaced(warning(error))
}

function createDebug(isDev, twinConfig) {
  return (reference, data, type = 'subdued') => {
    if (!isDev) return
    if (!twinConfig.debug) return
    const log = `${String(colors$1[type]('-'))} ${reference} ${String(
      colors$1[type](JSON.stringify(data))
    )}` // eslint-disable-next-line no-console

    console.log(log)
  }
}

function getTailwindConfig({ sourceRoot, filename, config, assert }) {
  var _sourceRoot

  sourceRoot = (_sourceRoot = sourceRoot) != null ? _sourceRoot : '.'
  const baseDirectory = filename ? path.dirname(filename) : process.cwd()
  const userTailwindConfig = config == null ? void 0 : config.config
  if (isObject(userTailwindConfig))
    return resolveTailwindConfig([
      // User config
      ...getAllConfigs(userTailwindConfig), // Default config
      ...getAllConfigs(defaultTailwindConfig),
    ])
  const configPath = userTailwindConfig
    ? path.resolve(sourceRoot, userTailwindConfig)
    : escalade(baseDirectory, (_, names) => {
        if (names.includes('tailwind.config.js')) {
          return 'tailwind.config.js'
        }

        if (names.includes('tailwind.config.cjs')) {
          return 'tailwind.config.cjs'
        }
      })
  const configExists = Boolean(configPath && fs.existsSync(configPath))
  if (userTailwindConfig)
    assert(configExists, ({ color }) =>
      [
        `${String(
          color(
            `✕ The tailwind config ${color(
              String(userTailwindConfig),
              'errorLight'
            )} wasn’t found`
          )
        )}`,
        `Update the \`config\` option in your twin config`,
      ].join('\n\n')
    )
  const configs = [
    // User config
    ...(configExists ? getAllConfigs(importFresh(configPath)) : []), // Default config
    ...getAllConfigs(defaultTailwindConfig),
  ]
  const tailwindConfig = resolveTailwindConfig(configs)
  return tailwindConfig
}

function runConfigValidator([item, value]) {
  const validatorConfig = configTwinValidators[item]
  if (!validatorConfig) return true
  const [validator, errorMessage] = validatorConfig
  if (typeof validator !== 'function') return false

  if (!validator(value)) {
    throw new Error(logGeneralError(String(errorMessage)))
  }

  return true
}

function getConfigTwin(config, params) {
  const output = { ...configDefaultsTwin(params), ...config }
  return output
}

function getConfigTwinValidated(config, params) {
  const twinConfig = getConfigTwin(config, params) // eslint-disable-next-line unicorn/no-array-reduce

  return Object.entries(twinConfig).reduce((result, item) => {
    const validatedItem = item
    return {
      ...result,
      ...(runConfigValidator(validatedItem) && {
        [validatedItem[0]]: validatedItem[1],
      }),
    }
  }, {})
}

function getFirstValue(list, getValue) {
  let firstValue
  const listLength = list.length - 1
  const listItem = list.find((listItem, index) => {
    const isLast = index === listLength
    firstValue = getValue(listItem, {
      index,
      isLast,
    })
    return Boolean(firstValue)
  })
  return [firstValue, listItem]
}

function checkExists(fileName, sourceRoot) {
  const [, value] = getFirstValue(toArray(fileName), existingFileName =>
    fs.existsSync(path.resolve(sourceRoot, `./${existingFileName}`))
  )
  return value
}

function getRelativePath(comparePath, filename) {
  const pathName = path.parse(filename).dir
  return path.relative(pathName, comparePath)
}

function getStitchesPath({ sourceRoot, filename, config }) {
  var _sourceRoot, _config$stitchesConfi

  sourceRoot = (_sourceRoot = sourceRoot) != null ? _sourceRoot : '.'
  const configPathCheck =
    (_config$stitchesConfi = config.stitchesConfig) != null
      ? _config$stitchesConfi
      : ['stitches.config.ts', 'stitches.config.js']
  const configPath = checkExists(configPathCheck, sourceRoot)
  if (!configPath)
    throw new Error(
      logGeneralError(
        `Couldn’t find the Stitches config at ${
          config.stitchesConfig
            ? `“${String(config.stitchesConfig)}”`
            : 'the project root'
        }.\nUse the twin config: stitchesConfig="PATH_FROM_PROJECT_ROOT" to set the location.`
      )
    )
  return getRelativePath(configPath, filename)
}

/**
 * Config presets
 *
 * To change the preset, add the following in `package.json`:
 * `{ "babelMacros": { "twin": { "preset": "styled-components" } } }`
 *
 * Or in `babel-plugin-macros.config.js`:
 * `module.exports = { twin: { preset: "styled-components" } }`
 */
const userPresets = {
  'styled-components': {
    styled: {
      import: 'default',
      from: 'styled-components',
    },
    css: {
      import: 'css',
      from: 'styled-components',
    },
    global: {
      import: 'createGlobalStyle',
      from: 'styled-components',
    },
  },
  emotion: {
    styled: {
      import: 'default',
      from: '@emotion/styled',
    },
    css: {
      import: 'css',
      from: '@emotion/react',
    },
    global: {
      import: 'Global',
      from: '@emotion/react',
    },
  },
  goober: {
    styled: {
      import: 'styled',
      from: 'goober',
    },
    css: {
      import: 'css',
      from: 'goober',
    },
    global: {
      import: 'createGlobalStyles',
      from: 'goober/global',
    },
  },
  stitches: {
    styled: {
      import: 'styled',
      from: 'stitches.config',
    },
    css: {
      import: 'css',
      from: 'stitches.config',
    },
    global: {
      import: 'global',
      from: 'stitches.config',
    },
  },
}

function dlv(t, e, l, n, r) {
  for (e = e.split ? e.split('.') : e, n = 0; n < e.length; n++)
    t = t ? t[e[n]] : r
  return t === r ? l : t
}

function createTheme(tailwindConfig) {
  function getConfigValue(path, defaultValue) {
    return dlv(tailwindConfig, path, defaultValue)
  }

  function resolveThemeValue(path, defaultValue, options = {}) {
    const [pathRoot, ...subPaths] = toPath(path)
    const value = getConfigValue(
      path ? ['theme', pathRoot, ...subPaths] : ['theme'],
      defaultValue
    )
    return sassifyValues(transformThemeValue(pathRoot)(value, options))
  }

  const out = Object.assign(
    (path, defaultValue) => resolveThemeValue(path, defaultValue),
    {
      withAlpha: (path, opacityValue) =>
        resolveThemeValue(path, undefined, {
          opacityValue,
        }),
    }
  )
  return out
}

function sassifyValues(values) {
  if (!isObject(values)) return values
  const transformed = Object.entries(values).map(([k, v]) => [
    k, // @ts-expect-error TOFIX: ts doesn't understand isObject
    (isObject(v) && sassifyValues(v)) ||
      (typeof v === 'number' && String(v)) ||
      v,
  ])
  return Object.fromEntries(transformed)
}

function createAssert(
  CustomError = Error,
  isSilent = false,
  hasLogColors = true
) {
  return (expression, message) => {
    if (isSilent) return

    if (typeof expression === 'string') {
      throw new CustomError(`\n\n${expression}\n`)
    }

    const messageContext = {
      color: makeColor$1(hasLogColors),
    }

    if (typeof expression === 'function') {
      throw new CustomError(`\n\n${expression(messageContext)}\n`)
    }

    if (expression) return

    if (typeof message === 'string') {
      throw new CustomError(`\n\n${message}\n`)
    }

    if (typeof message === 'function') {
      throw new CustomError(`\n\n${message(messageContext)}\n`)
    }
  }
}

/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */

function packageCheck(packageToCheck, params) {
  return (
    (params.config && params.config.preset === packageToCheck) ||
    params.styledImport.from.includes(packageToCheck) ||
    params.cssImport.from.includes(packageToCheck)
  )
}

function getPackageUsed(params) {
  return {
    isEmotion: packageCheck('emotion', params),
    isStyledComponents: packageCheck('styled-components', params),
    isGoober: packageCheck('goober', params),
    isStitches: packageCheck('stitches', params),
  }
}

function getStyledConfig({ sourceRoot, filename, config }) {
  const usedConfig =
    ((config == null ? void 0 : config.styled) && config) ||
    ((config == null ? void 0 : config.preset) && userPresets[config.preset]) ||
    userPresets.emotion

  if (typeof usedConfig.styled === 'string') {
    return {
      import: 'default',
      from: usedConfig.styled,
    }
  }

  if (config && config.preset === 'stitches') {
    const stitchesPath = getStitchesPath({
      sourceRoot,
      filename,
      config,
    })

    if (stitchesPath && usedConfig.styled) {
      // Overwrite the stitches import data with the path from the current file
      usedConfig.styled.from = stitchesPath
    }
  }

  return usedConfig.styled
}

function getCssConfig({ sourceRoot, filename, config }) {
  const usedConfig =
    ((config == null ? void 0 : config.css) && config) ||
    ((config == null ? void 0 : config.preset) && userPresets[config.preset]) ||
    userPresets.emotion

  if (typeof usedConfig.css === 'string') {
    return {
      import: 'css',
      from: usedConfig.css,
    }
  }

  if (config && config.preset === 'stitches') {
    const stitchesPath = getStitchesPath({
      sourceRoot,
      filename,
      config,
    })

    if (stitchesPath && usedConfig.css) {
      // Overwrite the stitches import data with the path from the current file
      usedConfig.css.from = stitchesPath
    }
  }

  return usedConfig.css
}

function getGlobalConfig(config) {
  const usedConfig =
    (config.global && config) ||
    (config.preset && userPresets[config.preset]) ||
    userPresets.emotion
  return usedConfig.global
}

function createCoreContext(params) {
  var _params$tailwindConfi

  const { sourceRoot, filename, config, isDev = false, CustomError } = params
  const assert = createAssert(
    CustomError,
    false,
    config == null ? void 0 : config.hasLogColors
  )
  const configParameters = {
    sourceRoot,
    assert,
    filename: filename != null ? filename : '',
    config,
  }
  const styledImport = getStyledConfig(configParameters)
  const cssImport = getCssConfig(configParameters)
  const tailwindConfig =
    (_params$tailwindConfi = params.tailwindConfig) != null
      ? _params$tailwindConfi
      : getTailwindConfig(configParameters)
  const packageUsed = getPackageUsed({
    config,
    cssImport,
    styledImport,
  })
  const twinConfig = getConfigTwinValidated(config, { ...packageUsed, isDev })
  const importConfig = {
    styled: styledImport,
    css: cssImport,
    global: getGlobalConfig(config != null ? config : {}),
  }
  return {
    isDev,
    assert,
    debug: createDebug(isDev, twinConfig),
    theme: createTheme(tailwindConfig),
    tailwindContext: createContext(tailwindConfig),
    packageUsed,
    tailwindConfig,
    twinConfig,
    CustomError,
    importConfig,
  }
}

const CAMEL_FIND = /\W+(.)/g
function camelize(string) {
  return string == null
    ? void 0
    : string.replace(CAMEL_FIND, (_, chr) => chr.toUpperCase())
}

const MATCH_THEME = /theme\((.+?)\)/
const MATCH_QUOTES = /["'`]/g

function replaceThemeValue(value, { assert, theme }) {
  const match = MATCH_THEME.exec(value)
  if (!match) return value
  const themeFunction = match[0]
  const themeParameters = match[1].replace(MATCH_QUOTES, '').trim()
  const [main, second] = themeParameters.split(',')
  let themeValue = theme(main, second)
  assert(Boolean(themeValue), ({ color }) =>
    color(
      `✕ ${color(
        themeParameters,
        'errorLight'
      )} doesn’t match a theme value from the config`
    )
  ) // Account for the 'DEFAULT' key

  if (typeof themeValue === 'object' && 'DEFAULT' in themeValue) {
    themeValue = themeValue.DEFAULT
  }

  const replacedValue = value.replace(themeFunction, String(themeValue))
  return replacedValue
}

const SELECTOR_PARENT_CANDIDATE = /^[ #.[]/
const SELECTOR_SPECIAL_STARTS = /^ [>@]/
const SELECTOR_ROOT = /(^| ):root(?!\w)/g
const UNDERSCORE_ESCAPING$1 = /\\+(_)/g
const WRAPPED_PARENT_SELECTORS = /(\({3}&(.*?)\){3})/g
const sassifySelectorTasks = [
  selector => selector.trim(), // Prefix with the parent selector when sassyPseudo is enabled,
  // otherwise just replace the class with the parent selector
  (selector, { selectorMatchReg, sassyPseudo, original }) => {
    const out = selector.replace(selectorMatchReg, (match, __, offset) => {
      if (selector === match) return ''

      if (
        /\w/.test(selector[offset - 1]) &&
        selector[offset + match.length] === ':'
      ) {
        if (sassyPseudo && selector[offset - 1] === undefined) return '&'
        return '' // Cover [section&]:hover:block / .btn.loading&:before
      }

      return offset === 0 ? '' : '&'
    }) // Fix certain matches not covered by the previous task, eg: `first:[section]:m-1`
    // (Arbitrary variants targeting html elements)

    if (original && out === selector && selector.includes(`.${original}`))
      return selector.replace(`.${original}`, '')
    return out
  }, // Unwrap the pre-wrapped parent selectors (pre-wrapping avoids matching issues against word characters, eg: `[&section]:block`)
  selector => selector.replace(WRAPPED_PARENT_SELECTORS, '&$2'), // Remove unneeded escaping from the selector
  selector => selector.replace(UNDERSCORE_ESCAPING$1, '$1'), // Prefix classes/ids/attribute selectors with a parent selector so styles
  // are applied to the current element rather than its children
  selector => {
    if (selector.includes('&')) return selector
    const addParentSelector = SELECTOR_PARENT_CANDIDATE.test(selector)
    if (!addParentSelector) return selector // Fix: ` > :not([hidden]) ~ :not([hidden])` / ` > *`
    // Fix: `[@page]:x`

    if (SELECTOR_SPECIAL_STARTS.test(selector)) return selector
    return `&${selector}`
  }, // Fix the spotty `:root` support in emotion/styled-components
  selector => selector.replace(SELECTOR_ROOT, '*:root'),
  selector => selector.trim(),
]

function sassifySelector(selector, params) {
  // Remove the selector if it only contains the parent selector
  if (selector === '&') {
    params.debug('selector not required', selector)
    return ''
  }

  for (const task of sassifySelectorTasks) {
    selector = task(selector, params)
  }

  return selector
}

const DEFAULTS_UNIVERSAL = '*, ::before, ::after'
const EMPTY_CSS_VARIABLE_VALUE = 'var(--tw-empty,/*!*/ /*!*/)'
const PRESERVED_ATRULE_TYPES = new Set([
  'charset',
  'counter-style',
  'document',
  'font-face',
  'font-feature-values',
  'import',
  'keyframes',
  'namespace',
])
const LAYER_DEFAULTS = 'defaults'
const LINEFEED$1 = /\n/g
const WORD_CHARACTER = /\w/
const SPACE_ID$1 = '_'
const SPACES = /\s+/g

const ESC_COMMA = /\\2c/g
const ESC_DIGIT = /\\3(\d)/g
const UNDERSCORE_ESCAPING = /\\+(_)/g
const BACKSLASH_ESCAPING = /\\\\/g

function transformImportant(value, params) {
  var _params$options

  if (params.passChecks === true) return value
  if (!params.hasImportant) return value // Avoid adding important if the rule doesn't respect it

  if (
    params.hasImportant &&
    ((_params$options = params.options) == null
      ? void 0
      : _params$options.respectImportant) === false
  )
    return value
  return `${value} !important`
}

function transformEscaping(value) {
  return value
    .replace(UNDERSCORE_ESCAPING, '$1') // Fix the duplicate escaping babel delivers
    .replace(BACKSLASH_ESCAPING, '\\')
}

const transformValueTasks = [
  replaceThemeValue,
  transformImportant,
  transformEscaping,
]

function transformDeclValue(value, params) {
  const valueOriginal = value

  for (const task of transformValueTasks) {
    value = task(value, params)
  }

  if (value !== valueOriginal)
    params.debug('converted theme/important', {
      old: valueOriginal,
      new: value,
    })
  return value
}

function extractFromRule(rule, params) {
  const selectorForUnescape = rule.selector.replace(ESC_DIGIT, '$1') // Remove digit escaping

  const selector = unescape(selectorForUnescape).replace(LINEFEED$1, ' ')
  return [selector, extractRuleStyles(rule.nodes, params)]
}

function extractSelectorFromAtRule(name, value, params) {
  if (name === LAYER_DEFAULTS) {
    if (params.includeUniversalStyles === false) return
    return DEFAULTS_UNIVERSAL
  }

  const val = value.replace(ESC_COMMA, ',') // Handle @screen usage in plugins, eg: `@screen md`

  if (name === 'screen') {
    const screenConfig = get__default['default'](
      params,
      'tailwindConfig.theme.screens'
    )
    return `@media (min-width: ${screenConfig[val]})`
  }

  return `@${name} ${val}`.trim()
}

const ruleTypes = {
  decl(decl, params) {
    const property = decl.prop.startsWith('--')
      ? decl.prop
      : camelize(decl.prop)
    const value =
      decl.prop.startsWith('--') && decl.value === ' '
        ? EMPTY_CSS_VARIABLE_VALUE // valid empty value in js, unlike ` `
        : transformDeclValue(decl.value, { ...params, decl, property })
    if (value === null) return // `background-clip: text` is still in "unofficial" phase and needs a
    // prefix in Firefox, Chrome and Safari.
    // https://caniuse.com/background-img-opts

    if (
      property === 'backgroundClip' &&
      (value === 'text' || value === 'text !important')
    )
      return {
        WebkitBackgroundClip: value,
        [property]: value,
      }
    return {
      [property]: value,
    }
  },

  // General styles, eg: `{ display: block }`
  rule(rule, params) {
    if (!rule.selector) {
      if (rule.nodes) {
        const styles = extractRuleStyles(rule.nodes, params)
        params.debug('rule has no selector, returning nodes', styles)
        return styles
      }

      params.debug('no selector found in rule', rule, 'error')
      return
    }

    let [selector, styles] = extractFromRule(rule, params)
    if (selector && styles === null) return

    if (params.passChecks) {
      const out = selector
        ? {
            [selector]: styles,
          }
        : styles
      params.debug('style pass return', out)
      return out
    }

    params.debug('styles extracted', {
      selector,
      styles,
    }) // As classes aren't used in css-in-js we split the selector into
    // multiple selectors and strip the ones that don't affect the current
    // element, eg: In `.this, .sub`, .sub is stripped as it has no target

    const selectorList = [...splitAtTopLevelOnly(selector, ',')].filter(s => {
      var _params$selectorMatch

      // Match the selector as a class
      const result =
        (_params$selectorMatch = params.selectorMatchReg) == null
          ? void 0
          : _params$selectorMatch.test(s) // Only keep selectors if they contain a `&` || aren’t
      // targeting multiple elements with classes

      if (!result && (s.includes('&') || !s.includes('.'))) return true
      return result
    })

    if (selectorList.length === 0) {
      params.debug('no selector match', selector, 'warn')
      return
    }

    if (selectorList.length === 1)
      params.debug('matched whole selector', selectorList[0])
    if (selectorList.length > 1)
      params.debug('matched multiple selectors', selectorList)
    selector = selectorList
      .map(s => sassifySelector(s, params))
      .filter(Boolean)
      .join(',')
    params.debug('sassified key', selector || styles)
    if (!selector) return styles
    return {
      [selector]: styles,
    }
  },

  // At-rules, eg: `@media __` && `@screen md`
  atrule(atrule, params) {
    const selector = extractSelectorFromAtRule(
      atrule.name,
      atrule.params,
      params
    )

    if (!selector) {
      params.debug(
        'no atrule selector found, removed',
        {
          name: atrule.name,
          params: atrule.params,
        },
        'warn'
      )
      return
    } // Strip keyframes from animate-* classes

    if (
      selector.startsWith('@keyframes') &&
      !params.passChecks &&
      params.twinConfig.moveKeyframesToGlobalStyles
    )
      return

    if (PRESERVED_ATRULE_TYPES.has(atrule.name)) {
      params.debug(`${atrule.name} pass given`, selector) // Rules that pass checks have no further style transformations

      params.passChecks = true
    }

    const styles = extractRuleStyles(atrule.nodes, params)
    if (!styles) return
    let ruleset = {
      [selector]: styles,
    }

    if (selector === DEFAULTS_UNIVERSAL) {
      // Add a cloned backdrop style
      ruleset = { ...ruleset, '::backdrop': styles }
      params.debug('universal default', styles)
    }

    params.debug('atrule', selector)
    return ruleset
  },
}

function extractRuleStyles(nodes, params) {
  const styles = nodes
    .map(rule => {
      const handler = ruleTypes[rule.type]
      if (!handler) return
      return handler(rule, params)
    })
    .filter(Boolean)
  if (styles.length === 0) return undefined // eslint-disable-next-line @typescript-eslint/no-unsafe-return

  return deepMerge__default['default'](styles[0], ...styles.slice(1))
}

function getGlobalStyles(params) {
  const candidates = [...params.tailwindContext.candidateRuleMap]
  const globalPluginStyles = candidates
    .flatMap(([, candidate]) => {
      const out = candidate.map(([data, rule]) => {
        if (data.layer !== LAYER_DEFAULTS) return
        return extractRuleStyles([rule], { ...params, passChecks: true })
      })
      if (out.length === 0) return
      return out
    })
    .filter(Boolean)
  const [globalKey, preflightRules] = candidates[0] // @ts-expect-error TOFIX: Fix tuple type error

  if (globalKey.trim() !== '*')
    return deepMerge__default['default'](...globalPluginStyles) // @ts-expect-error TOFIX: Fix tuple type error

  if (!Array.isArray(preflightRules))
    return deepMerge__default['default'](...globalPluginStyles)
  const preflightStyles = preflightRules.flatMap(([, rule]) =>
    extractRuleStyles([rule], { ...params, passChecks: true })
  )
  return deepMerge__default['default'](
    // @ts-expect-error TOFIX: Fix tuple type error
    ...preflightStyles,
    ...globalPluginStyles,
    ...globalKeyframeStyles(params)
  )
}

function globalKeyframeStyles(params) {
  if (params.twinConfig.moveKeyframesToGlobalStyles === false) return []
  const keyframes = params.theme('keyframes')
  if (!keyframes) return []
  return Object.entries(keyframes).map(([name, frames]) => ({
    [`@keyframes ${name}`]: frames,
  }))
}

const BRACKETED = /^\(.*?\)$/
const BRACKETED_MAYBE_IMPORTANT = /\)!?$/
const ESCAPE_CHARACTERS$1 = /\n|\t/g

function spreadVariantGroups(classes, context) {
  var _context$tailwindConf, _context$beforeImport, _context$afterImporta

  const pieces = [
    ...splitAtTopLevelOnly(
      classes.trim(),
      (_context$tailwindConf = context.tailwindConfig.separator) != null
        ? _context$tailwindConf
        : ':'
    ),
  ]
  let groupedClasses = pieces.pop()
  if (!groupedClasses) return [] // type guard
  // Check for too many dividers used
  // Added here instead of "validateClasses" as it's less error prone to check here

  context.assert(!pieces.includes(''), ({ color }) => {
    var _context$tailwindConf2

    return `${color(
      `✕ ${String(color(classes, 'errorLight'))} has too many dividers`
    )}\n\nUpdate to ${String(
      color(
        `${pieces
          .filter(Boolean)
          .join(
            (_context$tailwindConf2 = context.tailwindConfig.separator) != null
              ? _context$tailwindConf2
              : ':'
          )}`,
        'success'
      )
    )}`
  })
  let beforeImportant =
    (_context$beforeImport =
      context == null ? void 0 : context.beforeImportant) != null
      ? _context$beforeImport
      : ''
  let afterImportant =
    (_context$afterImporta =
      context == null ? void 0 : context.afterImportant) != null
      ? _context$afterImporta
      : ''

  if (!beforeImportant && groupedClasses.startsWith('!')) {
    groupedClasses = groupedClasses.slice(1)
    beforeImportant = '!'
  }

  if (!afterImportant && groupedClasses.endsWith('!')) {
    groupedClasses = groupedClasses.slice(0, -1)
    afterImportant = '!'
  } // Remove () brackets and split

  const unwrapped = BRACKETED.test(groupedClasses)
    ? groupedClasses.slice(1, -1)
    : groupedClasses
  const classList = [...splitAtTopLevelOnly(unwrapped, ' ')].filter(Boolean)
  const group = classList
    .map(className => {
      var _context$tailwindConf4

      if (
        BRACKETED_MAYBE_IMPORTANT.test(className) && // Avoid infinite loop due to lack of separator, eg: `[em](block)`
        !className.includes('](')
      ) {
        var _context$tailwindConf3

        const ctx = { ...context, beforeImportant, afterImportant }
        return expandVariantGroups(
          [...pieces, className].join(
            (_context$tailwindConf3 = context.tailwindConfig.separator) != null
              ? _context$tailwindConf3
              : ':'
          ),
          ctx
        )
      }

      return [...pieces, [beforeImportant, className, afterImportant].join('')]
        .filter(Boolean)
        .join(
          (_context$tailwindConf4 = context.tailwindConfig.separator) != null
            ? _context$tailwindConf4
            : ':'
        )
    })
    .filter(Boolean)
  return group
}

function expandVariantGroups(classes, context) {
  const classList = [
    ...splitAtTopLevelOnly(
      classes.replace(ESCAPE_CHARACTERS$1, ' ').trim(),
      ' '
    ),
  ]
  if (classList.length === 1 && ['', '()'].includes(classList[0])) return ''
  const expandedClasses = classList.flatMap(item =>
    spreadVariantGroups(item, context)
  )
  return expandedClasses.join(' ')
}

const REGEX_SPECIAL_CHARACTERS = /[$()*+./?[\\\]^{|}-]/g
function escapeRegex(string) {
  return string.replace(REGEX_SPECIAL_CHARACTERS, '\\$&')
}

function isShortCss(fullClassName, tailwindConfig) {
  var _tailwindConfig$separ

  const classPieces = [
    ...splitAtTopLevelOnly(
      fullClassName,
      (_tailwindConfig$separ = tailwindConfig.separator) != null
        ? _tailwindConfig$separ
        : ':'
    ),
  ]
  const className = classPieces.slice(-1)[0]
  if (!className.includes('[')) return false // Replace brackets before splitting on them as the split function already
  // reads brackets to determine where the top level is

  const splitAtArbitrary = [
    ...splitAtTopLevelOnly(className.replace(/\[/g, '∀'), '∀'),
  ] // Normal class

  if (splitAtArbitrary[0].endsWith('-')) return false // Important prefix

  if (splitAtArbitrary[0].endsWith('!')) return false // Arbitrary property

  if (splitAtArbitrary[0] === '') return false // Slash opacity, eg: bg-red-500/fromConfig/[.555]

  if (splitAtArbitrary[0].endsWith('/')) return false
  return true
}

// Split a string at a value and return an array of the two parts
function splitOnFirst(input, delim) {
  return (([first, ...rest]) => [first, rest.join(delim)])(input.split(delim))
}

const ALL_COMMAS = /,/g
const ALL_AMPERSANDS = /&/g
const ENDING_AMP_THEN_WHITESPACE = /&[\s_]*$/
const ALL_CLASS_DOTS = /(?<!\\)(\.)(?=\w)/g
const ALL_CLASS_ATS = /(?<!\\)(@)(?=\w)(?!media)/g
const ALL_WRAPPABLE_PARENT_SELECTORS = /&(?=([^ $)*+,.:>[_~])[\w-])/g
const BASIC_SELECTOR_TYPES = /^#|^\\.|[^\W_]/

function convertShortCssToArbitraryProperty(
  className,
  { tailwindConfig, assert, disableShortCss, isShortCssOnly, origClassName }
) {
  var _tailwindConfig$separ, _tailwindConfig$separ2, _tailwindConfig$separ3

  const splitArray = [
    ...splitAtTopLevelOnly(
      className,
      (_tailwindConfig$separ = tailwindConfig.separator) != null
        ? _tailwindConfig$separ
        : ':'
    ),
  ]
  const lastValue = splitArray.slice(-1)[0]
  let [property, value] = splitOnFirst(lastValue, '[')
  value = value.slice(0, -1).trim()
  let preSelector = ''

  if (property.startsWith('!')) {
    property = property.slice(1)
    preSelector = '!'
  }

  const template = `${preSelector}[${[
    property,
    value === '' ? "''" : value,
  ].join(
    (_tailwindConfig$separ2 = tailwindConfig.separator) != null
      ? _tailwindConfig$separ2
      : ':'
  )}]`
  splitArray.splice(-1, 1, template)
  const arbitraryProperty = splitArray.join(
    (_tailwindConfig$separ3 = tailwindConfig.separator) != null
      ? _tailwindConfig$separ3
      : ':'
  )
  const isShortCssDisabled = disableShortCss && !isShortCssOnly
  assert(!isShortCssDisabled, ({ color }) =>
    [
      `${String(
        color(
          `✕ ${String(
            color(origClassName, 'errorLight')
          )} uses twin’s deprecated short-css syntax`
        )
      )}`,
      `Update to ${String(color(arbitraryProperty, 'success'))}`,
      `To ignore this notice, add this to your twin config:\n{ "disableShortCss": false }`,
      `Read more at https://twinredirect.page.link/short-css`,
    ].join('\n\n')
  )
  return arbitraryProperty
}

function checkForVariantSupport({ className, tailwindConfig, assert }) {
  var _tailwindConfig$separ4

  const pieces = splitAtTopLevelOnly(
    className,
    (_tailwindConfig$separ4 = tailwindConfig.separator) != null
      ? _tailwindConfig$separ4
      : ':'
  )
  const hasMultipleVariants = pieces.length > 2
  const hasACommaInVariants = pieces.some(p => {
    const splits = splitAtTopLevelOnly(p.slice(1, -1), ',')
    return splits.length > 1
  })
  const hasIssue = hasMultipleVariants && hasACommaInVariants
  assert(
    !hasIssue,
    ({ color }) =>
      `${color(
        `✕ The variants on ${String(
          color(className, 'errorLight')
        )} are invalid tailwind and twin classes`
      )}\n\n${color(
        `To fix, either reduce all variants into a single arbitrary variant:`,
        'success'
      )}\nFrom: \`[.this, .that]:first:block\`\nTo: \`[.this:first, .that:first]:block\`\n\n${color(
        `Or split the class into separate classes instead of using commas:`,
        'success'
      )}\nFrom: \`[.this, .that]:first:block\`\nTo: \`[.this]:first:block [.that]:first:block\`\n\nRead more at https://twinredirect.page.link/arbitrary-variants-with-commas`
  )
} // Convert a twin class to a tailwindcss friendly class

function convertClassName(
  className,
  { tailwindConfig, theme, isShortCssOnly, disableShortCss, assert, debug }
) {
  checkForVariantSupport({
    className,
    tailwindConfig,
    assert,
  })
  const origClassName = className // Convert spaces to class friendly underscores

  className = className.replace(SPACES, SPACE_ID$1) // Move the bang to the front of the class

  if (className.endsWith('!')) {
    var _tailwindConfig$separ5, _tailwindConfig$separ6

    debug('trailing bang found', className)
    const splitArray = [
      ...splitAtTopLevelOnly(
        className.slice(0, -1),
        (_tailwindConfig$separ5 = tailwindConfig.separator) != null
          ? _tailwindConfig$separ5
          : ':'
      ),
    ] // Place a ! before the class

    splitArray.splice(-1, 1, `!${splitArray[splitArray.length - 1]}`)
    className = splitArray.join(
      (_tailwindConfig$separ6 = tailwindConfig.separator) != null
        ? _tailwindConfig$separ6
        : ':'
    )
  } // Convert short css to an arbitrary property, eg: `[display:block]`
  // (Short css is deprecated)

  if (isShortCss(className, tailwindConfig)) {
    debug('short css found', className)
    className = convertShortCssToArbitraryProperty(className, {
      tailwindConfig,
      assert,
      disableShortCss,
      isShortCssOnly,
      origClassName,
    })
  } // Replace theme values throughout the class

  className = replaceThemeValue(className, {
    assert,
    theme,
  }) // Add missing parent selectors and collapse arbitrary variants

  className = sassifyArbitraryVariants(className, {
    tailwindConfig,
  })
  debug('class after format', className)
  return className
}

function isArbitraryVariant(variant) {
  return variant.startsWith('[') && variant.endsWith(']')
}

function unbracket(variant) {
  return variant.slice(1, -1)
}

function sassifyArbitraryVariants(fullClassName, { tailwindConfig }) {
  var _tailwindConfig$separ7, _tailwindConfig$separ8

  const splitArray = [
    ...splitAtTopLevelOnly(
      fullClassName,
      (_tailwindConfig$separ7 = tailwindConfig.separator) != null
        ? _tailwindConfig$separ7
        : ':'
    ),
  ]
  const variants = splitArray.slice(0, -1)
  const className = splitArray.slice(-1)[0]
  if (variants.length === 0) return fullClassName // Collapse arbitrary variants when they don't contain `&`.
  // `[> div]:[.nav]:(flex block)` -> `[> div_.nav]:flex [> div_.nav]:block`

  const collapsed = []
  variants.forEach((variant, index) => {
    // We can’t match the selector if there's a character right next to the parent selector (eg: `[&section]:block`) otherwise we'd accidentally replace `.step` in classes like this:
    // Bad: `.steps-primary .steps` -> `&-primary &`
    // Good: `.steps-primary .steps` -> `.steps-primary &`
    // So here we replace it with crazy brackets to identify and unwrap it later
    if (isArbitraryVariant(variant))
      variant = variant.replace(ALL_WRAPPABLE_PARENT_SELECTORS, '(((&)))')
    if (
      index === 0 ||
      !isArbitraryVariant(variant) ||
      !isArbitraryVariant(variants[index - 1])
    )
      return collapsed.push(variant)
    const prev = collapsed[collapsed.length - 1]

    if (variant.includes('&')) {
      const prevHasParent = prev.includes('&') // Merge with current

      if (prevHasParent) {
        const mergedWithCurrent = variant.replace(
          ALL_AMPERSANDS,
          unbracket(prev)
        )
        const isLast = index === variants.length - 1
        collapsed[index - 1] = isLast
          ? mergedWithCurrent.replace(ALL_AMPERSANDS, '')
          : mergedWithCurrent
        return
      } // Merge with previous

      if (!prevHasParent) {
        const mergedWithPrev = `[${unbracket(variant).replace(
          ALL_AMPERSANDS,
          unbracket(prev)
        )}]`
        collapsed[collapsed.length - 1] = mergedWithPrev
        return
      }
    } // Parentless variants are merged into the previous arbitrary variant

    const mergedWithPrev = `[${[
      unbracket(prev).replace(ENDING_AMP_THEN_WHITESPACE, ''),
      unbracket(variant),
    ].join('_')}]`
    collapsed[collapsed.length - 1] = mergedWithPrev
  }) // The supplied class requires the reversal of it's variants as resolveMatches adds them in reverse order

  const reversedVariantList = [...collapsed].slice().reverse()
  const allVariants = reversedVariantList.map((v, idx) => {
    if (!isArbitraryVariant(v)) return v
    const unwrappedVariant = unbracket(v) // Unescaped dots incorrectly add the prefix within arbitrary variants (only when`prefix` is set in tailwind config)
      // eg: tw`[.a]:first:tw-block` -> `.tw-a &:first-child`
      .replace(ALL_CLASS_DOTS, '\\.') // Unescaped ats will throw a conversion error
      .replace(ALL_CLASS_ATS, '\\@')
    const variantList = unwrappedVariant.startsWith('@')
      ? [unwrappedVariant] // Arbitrary variants with commas are split, handled as separate selectors then joined
      : [...splitAtTopLevelOnly(unwrappedVariant, ',')]
    const out = variantList
      .map(variant => {
        var _collapsed

        return addParentSelector(
          variant,
          collapsed[idx - 1],
          (_collapsed = collapsed[idx + 1]) != null ? _collapsed : ''
        )
      }) // Tailwindcss removes everything from a comma onwards in arbitrary variants, so we need to encode to preserve them
      // Underscore is needed to distance the code from another possible number
      // Eg: [path[fill='rgb(51,100,51)']]:[fill:white]
      .join('\\2c_')
      .replace(ALL_COMMAS, '\\2c_')
    return `[${out}]`
  })
  return [...allVariants, className].join(
    (_tailwindConfig$separ8 = tailwindConfig.separator) != null
      ? _tailwindConfig$separ8
      : ':'
  )
}

function addParentSelector(selector, prev, next) {
  // Preserve selectors with a parent selector and media queries
  if (selector.includes('&') || selector.startsWith('@')) return selector // Arbitrary variants
  // Pseudo elements get an auto parent selector prefixed

  if (selector.startsWith(':')) return `&${selector}` // Variants that start with a class/id get treated as a child

  if (BASIC_SELECTOR_TYPES.test(selector) && !prev) return `& ${selector}` // When there's more than one variant and it's at the end then prefix it

  if (!next && prev) return `&${selector}`
  return `& ${selector}`
}

const IMPORTANT_OUTSIDE_BRACKETS =
  /(:!|^!)(?=(?:(?:(?!\)).)*\()|[^()]*$)(?=(?:(?:(?!]).)*\[)|[^[\]]*$)/
const COMMENTS_MULTI_LINE = /(?<!\/)\/(?!\/)\*[\S\s]*?\*\//g
const COMMENTS_SINGLE_LINE = /(?<!:)\/\/.*/g
const CLASS_DIVIDER_PIPE = / \| /g
const ALL_BRACKET_SQUARE_LEFT = /\[/g
const ALL_BRACKET_SQUARE_RIGHT = /]/g
const ALL_BRACKET_ROUND_LEFT = /\(/g
const ALL_BRACKET_ROUND_RIGHT = /\)/g
const ESCAPE_CHARACTERS = /\n|\t/g

function getStylesFromMatches(matches, params) {
  if (matches.length === 0) {
    params.debug('no matches supplied', {}, 'error')
    return
  }

  const rulesets = matches
    .map(([data, rule]) =>
      extractRuleStyles([rule], { ...params, options: data.options })
    )
    .filter(Boolean)

  if (rulesets.length === 0) {
    params.debug('no node rulesets found', {}, 'error')
    return
  } // @ts-expect-error Avoid tuple type error

  return deepMerge__default['default'](...rulesets)
} // When removing a multiline comment, determine if a space is left or not
// eg: You'd want a space left in this situation: tw`class1/* comment */class2`

function multilineReplaceWith(match, index, input) {
  const charBefore = input[index - 1]
  const directPrefixMatch = charBefore && WORD_CHARACTER.exec(charBefore)
  const charAfter = input[Number(index) + Number(match.length)]
  const directSuffixMatch = charAfter && WORD_CHARACTER.exec(charAfter)
  return directPrefixMatch != null &&
    directPrefixMatch[0] &&
    directSuffixMatch &&
    directSuffixMatch[0]
    ? ' '
    : ''
}

function validateClasses(classes, { assert, tailwindConfig }) {
  var _classes$match, _classes$match2, _classes$match3, _classes$match4

  // TOFIX: Avoid counting brackets within arbitrary values
  assert(
    ((_classes$match = classes.match(ALL_BRACKET_SQUARE_LEFT)) != null
      ? _classes$match
      : []
    ).length ===
      ((_classes$match2 = classes.match(ALL_BRACKET_SQUARE_RIGHT)) != null
        ? _classes$match2
        : []
      ).length,
    ({ color }) =>
      `${color(
        `✕ Unbalanced square brackets found in classes:\n\n${color(
          classes,
          'errorLight'
        )}`
      )}`
  ) // TOFIX: Avoid counting brackets within arbitrary values

  assert(
    ((_classes$match3 = classes.match(ALL_BRACKET_ROUND_LEFT)) != null
      ? _classes$match3
      : []
    ).length ===
      ((_classes$match4 = classes.match(ALL_BRACKET_ROUND_RIGHT)) != null
        ? _classes$match4
        : []
      ).length,
    ({ color }) =>
      `${color(
        `✕ Unbalanced round brackets found in classes:\n\n${color(
          classes,
          'errorLight'
        )}`
      )}`
  )

  for (const className of splitAtTopLevelOnly(classes, ' ')) {
    var _tailwindConfig$separ

    // Check for missing class attached to a variant
    const classCheck = className.replace(ESCAPE_CHARACTERS, ' ').trim()
    assert(
      !classCheck.endsWith(
        (_tailwindConfig$separ = tailwindConfig.separator) != null
          ? _tailwindConfig$separ
          : ':'
      ),
      ({ color }) =>
        `${color(
          `✕ The variant ${String(
            color(classCheck, 'errorLight')
          )} doesn’t look right`
        )}\n\nUpdate to ${String(
          color(`${classCheck}block`, 'success')
        )} or ${String(color(`${classCheck}(block mt-4)`, 'success'))}`
    )
  }

  return true
}

const tasks = [
  classes => classes.replace(CLASS_DIVIDER_PIPE, ' '),
  classes => classes.replace(COMMENTS_MULTI_LINE, multilineReplaceWith),
  classes => classes.replace(COMMENTS_SINGLE_LINE, ''),
  (classes, tailwindConfig, assert) =>
    expandVariantGroups(classes, {
      assert,
      tailwindConfig,
    }), // Expand grouped variants to individual classes
]

function bigSign(bigIntValue) {
  // @ts-expect-error Unsure of types here
  return (bigIntValue > 0n) - (bigIntValue < 0n)
}

function getOrderedClassList(
  tailwindContext,
  convertedClassList,
  classList,
  assert
) {
  assert(
    typeof (tailwindContext == null
      ? void 0
      : tailwindContext.getClassOrder) === 'function',
    ({ color }) =>
      color('Twin requires a newer version of tailwindcss, please update')
  ) // `getClassOrder` was added in tailwindcss@3.0.23

  let orderedClassList

  try {
    orderedClassList = tailwindContext
      .getClassOrder(convertedClassList)
      .map(([className, order], index) => [
        order || 0n,
        className,
        classList[index],
      ])
      .sort(([a], [z]) => bigSign(a - z))
  } catch (error) {
    assert(
      false,
      ({ color }) =>
        `${color(
          String(error).replace('with \\ may', 'with a single \\ may') // Improve error
        )}\n\n${color('Found in:')} ${color(
          convertedClassList.join(' '),
          'errorLight'
        )}`
    )
  }

  return orderedClassList
}

function getStyles(classes, params) {
  const assert = createAssert(
    params.CustomError,
    params.isSilent,
    params.twinConfig.hasLogColors
  )
  params.debug('string in', classes)
  assert(
    ![null, 'null', undefined].includes(classes),
    ({ color }) =>
      `${color(
        `✕ Your classes need to be complete strings for Twin to detect them correctly`
      )}\n\nRead more at https://twinredirect.page.link/template-literals`
  )
  validateClasses(classes, {
    tailwindConfig: params.tailwindConfig,
    assert,
  })

  for (const task of tasks) {
    classes = task(classes, params.tailwindConfig, assert)
  }

  params.debug('classes after format', classes)
  const matched = []
  const unmatched = []
  const styles = []
  const commonContext = {
    assert,
    theme: params.theme,
    debug: params.debug,
  }
  const convertedClassNameContext = {
    ...commonContext,
    tailwindConfig: params.tailwindConfig,
    isShortCssOnly: params.isShortCssOnly,
    disableShortCss: params.twinConfig.disableShortCss,
  }
  const classList = [...splitAtTopLevelOnly(classes, ' ')]
  const convertedClassList = classList.map(c =>
    convertClassName(c, convertedClassNameContext)
  )
  const orderedClassList = getOrderedClassList(
    params.tailwindContext,
    convertedClassList,
    classList,
    assert
  )
  const commonMatchContext = {
    ...commonContext,
    includeUniversalStyles: false,
    twinConfig: params.twinConfig,
    tailwindConfig: params.tailwindConfig,
    tailwindContext: params.tailwindContext,
    sassyPseudo: params.twinConfig.sassyPseudo,
  }

  for (const [, convertedClassName, className] of orderedClassList) {
    const matches = [
      ...resolveMatches(convertedClassName, params.tailwindContext),
    ]
    const results = getStylesFromMatches(matches, {
      ...commonMatchContext,
      hasImportant: IMPORTANT_OUTSIDE_BRACKETS.test(
        escapeRegex(convertedClassName)
      ),
      selectorMatchReg: new RegExp( // This regex specifies a list of characters allowed for the character
        // immediately after the class ends - this avoids matching other classes
        // eg: Input 'btn' will avoid matching '.btn-primary' in `.btn + .btn-primary`
        `(${escapeRegex(`.${convertedClassName}`)})(?=[\\[.# >~+*:$\\)]|$)`
      ),
      original: convertedClassName,
    })

    if (!results) {
      params.debug('🔥 No matching rules found', className, 'error') // Allow tw``/tw="" to pass through

      if (className !== '') unmatched.push(className) // If non-match and is on silent mode: Continue next iteration

      if (params.isSilent) continue // If non-match: Stop iteration and return
      // (This "for of" loop returns to the parent function)

      return {
        styles: undefined,
        matched,
        unmatched,
      }
    }

    matched.push(className)
    params.debug('✨ ruleset out', results, 'success')
    styles.push(results)
  }

  if (styles.length === 0)
    return {
      styles: undefined,
      matched,
      unmatched,
    } // @ts-expect-error Avoid tuple type error

  const mergedStyles = deepMerge__default['default'](...styles)
  return {
    styles: mergedStyles,
    matched,
    unmatched,
  }
}

function addImport({ types: t, program, mod, name, identifier }) {
  const importName =
    name === 'default'
      ? [t.importDefaultSpecifier(identifier)]
      : name
      ? [t.importSpecifier(identifier, t.identifier(name))]
      : []
  program.unshiftContainer(
    'body',
    t.importDeclaration(importName, t.stringLiteral(mod))
  )
}
/**
 * Convert plain js into babel ast
 */

function astify(literal, t) {
  if (literal === null) {
    return t.nullLiteral()
  }

  switch (typeof literal) {
    case 'function': {
      return t.unaryExpression('void', t.numericLiteral(0), true)
    }

    case 'number': {
      return t.numericLiteral(literal)
    }

    case 'boolean': {
      return t.booleanLiteral(literal)
    }

    case 'undefined': {
      return t.unaryExpression('void', t.numericLiteral(0), true)
    }

    case 'string': {
      return t.stringLiteral(literal)
    }

    default: {
      if (Array.isArray(literal)) {
        return t.arrayExpression(literal.map(x => astify(x, t)))
      }

      return t.objectExpression(objectExpressionElements(literal, t))
    }
  }
}

function objectExpressionElements(literal, t) {
  return Object.keys(literal)
    .filter(k => typeof literal[k] !== 'undefined')
    .map(k => t.objectProperty(t.stringLiteral(k), astify(literal[k], t)))
}

function setStyledIdentifier({ state, path, coreContext }) {
  const importFromStitches =
    coreContext.packageUsed.isStitches &&
    coreContext.importConfig.styled.from.includes(path.node.source.value)
  const importFromLibrary =
    path.node.source.value === coreContext.importConfig.styled.from
  if (!importFromLibrary && !importFromStitches) return // Look for an existing import that matches the config,
  // if found then reuse it for the rest of the function calls

  path.node.specifiers.some(specifier => {
    if (
      specifier.type === 'ImportDefaultSpecifier' &&
      coreContext.importConfig.styled.import === 'default' && // fixes an issue in gatsby where the styled-components plugin has run
      // before twin. fix is to ignore import aliases which babel creates
      // https://github.com/ben-rogerson/twin.macro/issues/192
      !specifier.local.name.startsWith('_')
    ) {
      state.styledIdentifier = specifier.local
      state.existingStyledIdentifier = true
      return true
    }

    if (
      specifier.type === 'ImportSpecifier' &&
      specifier.imported.type === 'Identifier' &&
      specifier.imported.name === coreContext.importConfig.styled.import
    ) {
      state.styledIdentifier = specifier.local
      state.existingStyledIdentifier = true
      return true
    }

    state.existingStyledIdentifier = false
    return false
  })
}

function setCssIdentifier({ state, path, coreContext }) {
  const importFromStitches =
    coreContext.packageUsed.isStitches &&
    coreContext.importConfig.css.from.includes(path.node.source.value)
  const isLibraryImport =
    path.node.source.value === coreContext.importConfig.css.from
  if (!isLibraryImport && !importFromStitches) return // Look for an existing import that matches the config,
  // if found then reuse it for the rest of the function calls

  path.node.specifiers.some(specifier => {
    if (
      specifier.type === 'ImportDefaultSpecifier' &&
      coreContext.importConfig.css.import === 'default'
    ) {
      state.cssIdentifier = specifier.local
      state.existingCssIdentifier = true
      return true
    }

    if (
      specifier.type === 'ImportSpecifier' &&
      specifier.imported.type === 'Identifier' &&
      specifier.imported.name === coreContext.importConfig.css.import
    ) {
      state.cssIdentifier = specifier.local
      state.existingCssIdentifier = true
      return true
    }

    state.existingCssIdentifier = false
    return false
  })
}

function getStringFromTTE(path) {
  var _path$get$evaluate$va

  let getRawValue = false
  let rawValue = '' // Convert basic interpolated variables defined in the same file

  const evaluatedValue =
    (_path$get$evaluate$va = path.get('quasi').evaluate().value) != null
      ? _path$get$evaluate$va
      : ''
  if (evaluatedValue === '') getRawValue = true // Evaluating strips escaping, so if there's a square bracket we know it's an
  // arbitrary value/property/variant and should grab the raw value

  if (evaluatedValue.includes('[')) getRawValue = true
  if (getRawValue)
    rawValue = path
      .get('quasi.quasis')
      .map(q => q.node.value.raw)
      .join('') // Trigger error due to non-evaluated value, eg:`w-[${sizes.width}]`

  if (evaluatedValue.length === 0 && rawValue.length > 0) return 'null' // Return raw classes with escaping, eg: [content\!]:block

  if (rawValue.length > evaluatedValue.length) return rawValue
  return evaluatedValue
} // Parse tagged template arrays (``)

function parseTte(path, { t, state }) {
  const cloneNode = t.cloneNode || t.cloneDeep
  const tagType = path.node.tag.type
  if (
    tagType !== 'Identifier' &&
    tagType !== 'MemberExpression' &&
    tagType !== 'CallExpression'
  )
    return
  const string = getStringFromTTE(path) // Grab the path location before changing it

  const stringLoc = path.get('quasi').node.loc

  if (tagType === 'CallExpression') {
    replaceWithLocation(
      path.get('tag').get('callee'), // @ts-expect-error Source type doesn’t include `Identifier` as possible type
      cloneNode(state.styledIdentifier)
    )
    state.isImportingStyled = true
  } else if (tagType === 'MemberExpression') {
    replaceWithLocation(
      path.get('tag').get('object'), // @ts-expect-error Source type doesn’t include `Identifier` as possible type
      cloneNode(state.styledIdentifier)
    )
    state.isImportingStyled = true
  }

  if (tagType === 'CallExpression' || tagType === 'MemberExpression') {
    replaceWithLocation(
      path,
      t.callExpression(cloneNode(path.node.tag), [
        t.identifier('__twPlaceholder'),
      ])
    )
    path = path.get('arguments')[0]
  }

  path.node.loc = stringLoc // Restore the original path location

  return {
    string,
    path,
  }
}

function replaceWithLocation(path, replacement) {
  const { loc } = path.node
  const newPaths = replacement ? path.replaceWith(replacement) : []

  if (Array.isArray(newPaths) && newPaths.length > 0) {
    newPaths.forEach(p => {
      p.node.loc = loc
    })
  }

  return newPaths
}

function generateUid(name, program) {
  return program.scope.generateUidIdentifier(name)
}

function getParentJSX(path) {
  return path.findParent(p => p.isJSXOpeningElement())
}

function getAttributeNames(jsxPath) {
  const attributes = jsxPath.get('attributes')
  const attributeNames = attributes.map(p => {
    var _p$node$name

    return (_p$node$name = p.node.name) == null ? void 0 : _p$node$name.name
  })
  return attributeNames
}

function getCssAttributeData(attributes) {
  if (!String(attributes))
    return {
      index: 0,
      hasCssAttribute: false,
      attribute: undefined,
    }
  const index = attributes.findIndex(
    attribute =>
      (attribute == null ? void 0 : attribute.isJSXAttribute()) &&
      attribute.get('name.name').node === 'css'
  )
  return {
    index,
    hasCssAttribute: index >= 0,
    attribute: attributes[index],
  }
}

function getFunctionValue(
  path // eslint-disable-next-line @typescript-eslint/no-explicit-any
) {
  if (path.parent.type !== 'CallExpression') return
  const parent = path.findParent(x => x.isCallExpression())
  if (!parent) return
  const argument = parent.get('arguments')[0] || ''
  return {
    parent,
    input: argument.evaluate && argument.evaluate().value,
  }
}

function getTaggedTemplateValue(path) {
  if (path.parent.type !== 'TaggedTemplateExpression') return
  const parent = path.findParent(x => x.isTaggedTemplateExpression())
  if (!parent) return
  if (parent.node.tag.type !== 'Identifier') return
  return {
    parent,
    input: parent.get('quasi').evaluate().value,
  }
}

function getMemberExpression(path) {
  if (path.parent.type !== 'MemberExpression') return
  const parent = path.findParent(x => x.isMemberExpression())
  if (!parent) return
  return {
    parent,
    // @ts-expect-error name doesn't exist on node
    input: parent.get('property').node.name,
  }
}

function generateTaggedTemplateExpression({ t, identifier, styles }) {
  const backtickStyles = t.templateElement({
    raw: `${styles != null ? styles : ''}`,
    cooked: `${styles != null ? styles : ''}`,
  })
  const ttExpression = t.taggedTemplateExpression(
    identifier,
    t.templateLiteral([backtickStyles], [])
  )
  return ttExpression
}

function isComponent(name) {
  return name.slice(0, 1).toUpperCase() === name.slice(0, 1)
}

const jsxSingleDotError = `The css prop + tw props can only be added to jsx elements with a single dot in their name (or no dot at all).`

function getFirstStyledArgument(jsxPath, t, assert) {
  const path = get__default['default'](jsxPath, 'node.name.name')
  if (path)
    return isComponent(path) ? t.identifier(path) : t.stringLiteral(path)
  const dotComponent = get__default['default'](jsxPath, 'node.name')
  assert(Boolean(dotComponent), () => jsxSingleDotError) // Element name has dots in it

  const objectName = get__default['default'](dotComponent, 'object.name')
  assert(Boolean(objectName), () => jsxSingleDotError)
  const propertyName = get__default['default'](dotComponent, 'property.name')
  assert(Boolean(propertyName), () => jsxSingleDotError)
  return t.memberExpression(
    t.identifier(objectName),
    t.identifier(propertyName)
  )
}

function makeStyledComponent({
  t,
  secondArg,
  jsxPath,
  program,
  state,
  coreContext,
}) {
  const constName = program.scope.generateUidIdentifier('TwComponent')

  if (!state.styledIdentifier) {
    state.styledIdentifier = generateUid('styled', program)
    state.isImportingStyled = true
  }

  const firstArg = getFirstStyledArgument(jsxPath, t, coreContext.assert)
  const args = [firstArg, secondArg].filter(Boolean)
  const identifier = t.callExpression(state.styledIdentifier, args)
  const styledProps = [t.variableDeclarator(constName, identifier)]
  const styledDefinition = t.variableDeclaration('const', styledProps)
  const rootParentPath = jsxPath.findParent(p =>
    p.parentPath ? p.parentPath.isProgram() : false
  )
  if (rootParentPath) rootParentPath.insertBefore(styledDefinition)

  if (t.isMemberExpression(firstArg)) {
    // Replace components with a dot, eg: Dialog.blah
    const id = t.jsxIdentifier(constName.name)
    jsxPath.get('name').replaceWith(id)
    if (jsxPath.node.selfClosing) return
    jsxPath.parentPath.get('closingElement.name').replaceWith(id)
  } else {
    jsxPath.node.name.name = constName.name
    if (jsxPath.node.selfClosing) return // @ts-expect-error Untyped name replacement

    jsxPath.parentPath.node.closingElement.name.name = constName.name
  }
}

function getJsxAttributes(path) {
  const attributes = path.get('openingElement.attributes')
  return attributes.filter(a => a.isJSXAttribute())
}

const validImports = new Set([
  'default',
  'styled',
  'css',
  'theme',
  'screen',
  'TwStyle',
  'TwComponent',
  'ThemeStyle',
  'GlobalStyles',
  'globalStyles',
])
function validateImports(imports, coreContext) {
  const importTwAsNamedNotDefault = Object.keys(imports).find(
    reference => reference === 'tw'
  )
  coreContext.assert(
    !importTwAsNamedNotDefault,
    ({ color }) =>
      `${color(
        `✕ import { tw } from 'twin.macro'`
      )}\n\nUse the default export for \`tw\`:\n\n${color(
        `import tw from 'twin.macro'`,
        'success'
      )}`
  )
  const unsupportedImport = Object.keys(imports).find(
    reference => !validImports.has(reference)
  )
  coreContext.assert(
    !unsupportedImport,
    ({ color }) =>
      `${color(
        `✕ Twin doesn't recognize { ${String(unsupportedImport)} }`
      )}\n\nTry one of these imports:\n\nimport ${color(
        'tw',
        'success'
      )}, { ${color('styled', 'success')}, ${color('css', 'success')}, ${color(
        'theme',
        'success'
      )}, ${color('screen', 'success')}, ${color(
        'GlobalStyles',
        'success'
      )}, ${color('globalStyles', 'success')} } from 'twin.macro'`
  )
}

function isEmpty(value) {
  return (
    value === undefined ||
    value === null ||
    (typeof value === 'object' && Object.keys(value).length === 0) ||
    (typeof value === 'string' && value.trim().length === 0)
  )
}

function updateCssReferences({ references, state }) {
  if (state.existingCssIdentifier) return
  const cssReferences = references.css
  if (isEmpty(cssReferences)) return
  cssReferences.forEach(path => {
    // @ts-expect-error Setting value on target
    path.node.name = state.cssIdentifier.name
  })
}

function addCssImport({ references, program, t, state, coreContext }) {
  if (!state.isImportingCss) {
    const shouldImport =
      !isEmpty(references.css) && !state.existingCssIdentifier
    if (!shouldImport) return
  }

  if (state.existingCssIdentifier) return
  if (!coreContext.importConfig.css) return
  addImport({
    types: t,
    program,
    name: coreContext.importConfig.css.import,
    mod: coreContext.importConfig.css.from,
    identifier: state.cssIdentifier,
  })
}

function convertHtmlElementToStyled(params) {
  const { path, t, coreContext } = params
  if (!coreContext.twinConfig.convertHtmlElementToStyled) return
  const jsxPath = path.get('openingElement')
  makeStyledComponent({ ...params, jsxPath, secondArg: t.objectExpression([]) })
}

function updateStyledReferences({ references, state }) {
  if (state.existingStyledIdentifier) return
  const styledReferences = references.styled
  if (isEmpty(styledReferences)) return
  styledReferences.forEach(path => {
    // @ts-expect-error Setting values is untyped
    path.node.name = state.styledIdentifier.name
  })
}

function addStyledImport({ references, program, t, state, coreContext }) {
  if (!state.isImportingStyled) {
    const shouldImport =
      !isEmpty(references.styled) && !state.existingStyledIdentifier
    if (!shouldImport) return
  }

  if (state.existingStyledIdentifier) return
  addImport({
    types: t,
    program,
    name: coreContext.importConfig.styled.import,
    mod: coreContext.importConfig.styled.from,
    identifier: state.styledIdentifier,
  })
}

function moveDotElementToParam({ path, t }) {
  if (path.parent.type !== 'MemberExpression') return
  const parentCallExpression = path.findParent(x => x.isCallExpression())
  if (!parentCallExpression) return
  const styledName = get__default['default'](
    path,
    'parentPath.node.property.name'
  )
  const styledArgs = get__default['default'](
    parentCallExpression,
    'node.arguments.0'
  )
  const args = [t.stringLiteral(styledName), styledArgs].filter(Boolean)
  const replacement = t.callExpression(path.node, args)
  replaceWithLocation(parentCallExpression, replacement)
}

function handleStyledFunction({ references, t, coreContext }) {
  if (!coreContext.twinConfig.convertStyledDot) return
  if (isEmpty(references)) return
  const defaultRefs = references.default || []
  const styledRefs = references.styled || []
  ;[...defaultRefs, ...styledRefs].filter(Boolean).forEach(path => {
    // convert tw.div`` & styled.div`` to styled('div', {})
    moveDotElementToParam({
      path,
      t,
    })
  })
}

function handleThemeFunction({ references, t, coreContext }) {
  if (!references.theme) return
  references.theme.forEach(path => {
    var _ref, _getTaggedTemplateVal

    const ttValue =
      (_ref =
        (_getTaggedTemplateVal = getTaggedTemplateValue(path)) != null
          ? _getTaggedTemplateVal
          : getFunctionValue(path)) != null
        ? _ref
        : {
            input: null,
            parent: null,
          }
    const { input, parent } = ttValue
    if (input !== '')
      coreContext.assert(
        Boolean(input),
        ({ color }) =>
          `${color(`✕ The theme value doesn’t look right`)}\n\nTry ${color(
            'theme`colors.black`',
            'success'
          )} or ${color(`theme('colors.black')`, 'success')}`
      )
    coreContext.assert(
      Boolean(parent),
      ({ color }) =>
        `${color(
          `✕ The theme value ${color(input, 'errorLight')} doesn’t look right`
        )}\n\nTry ${color('theme`colors.black`', 'success')} or ${color(
          `theme('colors.black')`,
          'success'
        )}`
    )
    const themeValue = coreContext.theme(input)
    coreContext.assert(Boolean(themeValue), ({ color }) =>
      color(
        `✕ ${color(
          input,
          'errorLight'
        )} doesn’t match a theme value from the config`
      )
    )
    return replaceWithLocation(parent, astify(themeValue, t))
  })
}

function getDirectReplacement({ mediaQuery, parent, t }) {
  return {
    newPath: parent,
    replacement: astify(mediaQuery, t),
  }
}

function handleDefinition({ mediaQuery, parent, type, t }) {
  return {
    TaggedTemplateExpression() {
      const newPath = parent.findParent(x => x.isTaggedTemplateExpression())
      const query = [`${mediaQuery} { `, ` }`]
      const quasis = [
        t.templateElement(
          {
            raw: query[0],
            cooked: query[0],
          },
          false
        ),
        t.templateElement(
          {
            raw: query[1],
            cooked: query[1],
          },
          true
        ),
      ]
      const expressions = [newPath.get('quasi').node]
      const replacement = t.templateLiteral(quasis, expressions)
      return {
        newPath,
        replacement,
      }
    },

    CallExpression() {
      const newPath = parent.findParent(x => x.isCallExpression())
      const value = newPath.get('arguments')[0].node
      const replacement = t.objectExpression([
        t.objectProperty(t.stringLiteral(mediaQuery), value),
      ])
      return {
        newPath,
        replacement,
      }
    },

    ObjectProperty() {
      // Remove brackets around keys so merges work with tailwind screens
      // styled.div({ [screen`2xl`]: tw`block`, ...tw`2xl:inline` })
      // https://github.com/ben-rogerson/twin.macro/issues/379
      // @ts-expect-error unsure of parent type
      parent.parent.computed = false
      return getDirectReplacement({
        mediaQuery,
        parent,
        t,
      })
    },

    ExpressionStatement: () =>
      getDirectReplacement({
        mediaQuery,
        parent,
        t,
      }),
    ArrowFunctionExpression: () =>
      getDirectReplacement({
        mediaQuery,
        parent,
        t,
      }),
    ArrayExpression: () =>
      getDirectReplacement({
        mediaQuery,
        parent,
        t,
      }),
    BinaryExpression: () =>
      getDirectReplacement({
        mediaQuery,
        parent,
        t,
      }),
    LogicalExpression: () =>
      getDirectReplacement({
        mediaQuery,
        parent,
        t,
      }),
    ConditionalExpression: () =>
      getDirectReplacement({
        mediaQuery,
        parent,
        t,
      }),
    VariableDeclarator: () =>
      getDirectReplacement({
        mediaQuery,
        parent,
        t,
      }),
    TemplateLiteral: () =>
      getDirectReplacement({
        mediaQuery,
        parent,
        t,
      }),
    TSAsExpression: () =>
      getDirectReplacement({
        mediaQuery,
        parent,
        t,
      }),
  }[type]
}

function getMediaQuery({ input, screens, assert }) {
  const screen = screens[input]
  assert(
    Boolean(screen),
    ({ color }) =>
      `${color(
        `${
          input
            ? `✕ ${color(input, 'errorLight')} wasn’t found in your`
            : 'Specify a screen value from your'
        } tailwind config`
      )}\n\nTry one of these values:\n\n${Object.entries(screens)
        .map(
          ([k, v]) =>
            `${color('-', 'subdued')} screen(${color(
              `'${k}'`,
              'success'
            )})({ ... }) (${String(v)})`
        )
        .join('\n')}`
  )
  let mediaQuery

  if (typeof screen === 'string') {
    mediaQuery = '@media (min-width: ' + screen + ')'
  } else if (!Array.isArray(screen) && typeof screen.raw === 'string') {
    mediaQuery = '@media ' + screen.raw
  } else {
    const string = (Array.isArray(screen) ? screen : [screen])
      .map(range =>
        [
          typeof range.min === 'string' ? `(min-width: ${range.min} )` : null,
          typeof range.max === 'string' ? `(max-width: ${range.max}) ` : null,
        ]
          .filter(Boolean)
          .join(' and ')
      )
      .join(', ')
    mediaQuery = string ? '@media ' + string : ''
  } // const mediaQuery = `@media (min-width: ${String(screen)})`

  return mediaQuery
}

function handleScreenFunction({ references, t, coreContext }) {
  if (!references.screen) return
  const screens = coreContext.theme('screens')
  references.screen.forEach(path => {
    var _ref, _ref2, _getTaggedTemplateVal

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { input, parent } =
      (_ref =
        (_ref2 =
          (_getTaggedTemplateVal = getTaggedTemplateValue(path)) != null
            ? _getTaggedTemplateVal // screen.lg``
            : getFunctionValue(path)) != null
          ? _ref2 // screen.lg({ })
          : getMemberExpression(path)) != null
        ? _ref
        : {
            // screen`lg`
            input: null,
            parent: null,
          }
    const definition = handleDefinition({
      type: parent.parent.type,
      mediaQuery: getMediaQuery({
        input: input,
        screens,
        assert: coreContext.assert,
      }),
      parent: parent,
      t,
    })
    coreContext.assert(
      Boolean(definition),
      ({ color }) =>
        `${color(
          `✕ The screen import doesn’t support that syntax`
        )}\n\nTry using it like this: ${color(
          [Object.keys(screens)[0]].map(f => `screen("${f}")`).join(''),
          'success'
        )}`
    )
    const { newPath, replacement } = definition()
    replaceWithLocation(newPath, replacement)
  })
}

// eslint-disable-next-line import/no-relative-parent-imports
const KEBAB_CANDIDATES = /([\da-z]|(?=[A-Z]))([A-Z])/g

function addGlobalStylesImport({ program, t, identifier, coreContext }) {
  addImport({
    types: t,
    program,
    identifier,
    name: coreContext.importConfig.global.import,
    mod: coreContext.importConfig.global.from,
  })
}

function getGlobalDeclarationTte({ t, stylesUid, globalUid, styles }) {
  return t.variableDeclaration('const', [
    t.variableDeclarator(
      globalUid,
      generateTaggedTemplateExpression({
        t,
        identifier: stylesUid,
        styles,
      })
    ),
  ])
}

function getGlobalDeclarationProperty(params) {
  const { t, stylesUid, globalUid, state, styles } = params
  const ttExpression = generateTaggedTemplateExpression({
    t,
    identifier: state.cssIdentifier,
    styles,
  })
  const openingElement = t.jsxOpeningElement(
    t.jsxIdentifier(stylesUid.name),
    [
      t.jsxAttribute(
        t.jsxIdentifier('styles'),
        t.jsxExpressionContainer(ttExpression)
      ),
    ],
    true
  )
  const closingElement = t.jsxClosingElement(t.jsxIdentifier('close'))
  const arrowFunctionExpression = t.arrowFunctionExpression(
    [],
    t.jsxElement(openingElement, closingElement, [], true)
  )
  const code = t.variableDeclaration('const', [
    t.variableDeclarator(globalUid, arrowFunctionExpression),
  ])
  return code
}

function kebabize(string) {
  return string.replace(KEBAB_CANDIDATES, '$1-$2').toLowerCase()
}

function convert(k, v) {
  return typeof v === 'string'
    ? `  ${kebabize(k)}: ${v};`
    : `${k} {
${convertCssObjectToString(v)}
}`
}

function convertCssObjectToString(cssObject) {
  if (!cssObject) return ''
  return Object.entries(cssObject)
    .map(([k, v]) => convert(k, v))
    .join('\n')
}

function handleGlobalStylesFunction(params) {
  const { references } = params
  if (references.GlobalStyles) handleGlobalStylesJsx(params)
  if (references.globalStyles) handleGlobalStylesVariable(params)
}

function handleGlobalStylesVariable(params) {
  const { references } = params
  if (references.globalStyles.length === 0) return
  const styles = getGlobalStyles(params.coreContext)
  references.globalStyles.forEach(path => {
    const templateStyles = `(${JSON.stringify(styles)})` // `template` requires () wrapping

    const convertedStyles = template__default['default'](templateStyles, {
      placeholderPattern: false,
    })()
    path.replaceWith(convertedStyles)
  })
}

function handleGlobalStylesJsx(params) {
  const { references, program, t, state, coreContext } = params
  if (references.GlobalStyles.length === 0) return
  coreContext.assert(
    references.GlobalStyles.length < 2,
    ({ color }) =>
      `${color(
        `✕ Only one <GlobalStyles /> can be added per file`
      )}\n\nNeed something custom?\nUse the \`globalStyles\` import for a style object you can work with`
  )
  const path = references.GlobalStyles[0]
  const parentPath = path.findParent(x => x.isJSXElement())
  coreContext.assert(
    Boolean(parentPath),
    ({ color }) =>
      `${color(
        `✕ The \`GlobalStyles\` import must be added as a JSX element`
      )}\neg: \`<GlobalStyles />\`\n\nNeed something custom?\nUse the \`globalStyles\` import for a style object you can work with`
  )
  const globalStyles = getGlobalStyles(params.coreContext)
  const styles = convertCssObjectToString(globalStyles)
  const globalUid = generateUid('GlobalStyles', program)
  const stylesUid = generateUid('globalImport', program)
  const declarationData = {
    t,
    globalUid,
    stylesUid,
    styles,
    state,
  }

  if (coreContext.packageUsed.isStyledComponents) {
    const declaration = getGlobalDeclarationTte(declarationData)
    program.unshiftContainer('body', declaration)
    path.replaceWith(t.jSXIdentifier(globalUid.name))
  }

  if (coreContext.packageUsed.isEmotion) {
    const declaration = getGlobalDeclarationProperty(declarationData)
    program.unshiftContainer('body', declaration)
    path.replaceWith(t.jSXIdentifier(globalUid.name)) // Check if the css import has already been imported
    // https://github.com/ben-rogerson/twin.macro/issues/313

    state.isImportingCss = !state.existingCssIdentifier
  }

  if (coreContext.packageUsed.isGoober) {
    const declaration = getGlobalDeclarationTte(declarationData)
    program.unshiftContainer('body', declaration)
    path.replaceWith(t.jSXIdentifier(globalUid.name))
  }

  coreContext.assert(
    Boolean(!coreContext.packageUsed.isStitches),
    ({ color }) =>
      `${color(
        `✕ The ${color(
          'GlobalStyles',
          'errorLight'
        )} import can’t be used with stitches`
      )}\n\nUse the ${color(`globalStyles`, 'success')} import instead`
  )
  addGlobalStylesImport({
    identifier: stylesUid,
    t,
    program,
    coreContext,
  })
}

var src = {
  compareTwoStrings: compareTwoStrings,
  findBestMatch: findBestMatch,
}

function compareTwoStrings(first, second) {
  first = first.replace(/\s+/g, '')
  second = second.replace(/\s+/g, '')

  if (first === second) return 1 // identical or empty
  if (first.length < 2 || second.length < 2) return 0 // if either is a 0-letter or 1-letter string

  let firstBigrams = new Map()
  for (let i = 0; i < first.length - 1; i++) {
    const bigram = first.substring(i, i + 2)
    const count = firstBigrams.has(bigram) ? firstBigrams.get(bigram) + 1 : 1

    firstBigrams.set(bigram, count)
  }
  let intersectionSize = 0
  for (let i = 0; i < second.length - 1; i++) {
    const bigram = second.substring(i, i + 2)
    const count = firstBigrams.has(bigram) ? firstBigrams.get(bigram) : 0

    if (count > 0) {
      firstBigrams.set(bigram, count - 1)
      intersectionSize++
    }
  }

  return (2.0 * intersectionSize) / (first.length + second.length - 2)
}

function findBestMatch(mainString, targetStrings) {
  if (!areArgsValid(mainString, targetStrings))
    throw new Error(
      'Bad arguments: First argument should be a string, second should be an array of strings'
    )

  const ratings = []
  let bestMatchIndex = 0

  for (let i = 0; i < targetStrings.length; i++) {
    const currentTargetString = targetStrings[i]
    const currentRating = compareTwoStrings(mainString, currentTargetString)
    ratings.push({ target: currentTargetString, rating: currentRating })
    if (currentRating > ratings[bestMatchIndex].rating) {
      bestMatchIndex = i
    }
  }

  const bestMatch = ratings[bestMatchIndex]

  return {
    ratings: ratings,
    bestMatch: bestMatch,
    bestMatchIndex: bestMatchIndex,
  }
}

function areArgsValid(mainString, targetStrings) {
  if (typeof mainString !== 'string') return false
  if (!Array.isArray(targetStrings)) return false
  if (!targetStrings.length) return false
  if (
    targetStrings.find(function (s) {
      return typeof s !== 'string'
    })
  )
    return false
  return true
}

function validateVariants(variantMatch, context) {
  if (!variantMatch) return
  if (variantMatch.startsWith('[')) return
  const variantCandidates = [...context.variants] // Exact variant match

  if (variantCandidates.includes(variantMatch)) return
  const results = variantCandidates
    .map(variant => {
      const rating = variantMatch
        ? Number(src.compareTwoStrings(variant, variantMatch))
        : 0
      if (rating < 0.2) return
      return [variant, rating]
    })
    .filter(Boolean)
  const errorText = `${context.color(
    `✕ Variant ${context.color(`${variantMatch}`, 'errorLight')} was not found`,
    'error'
  )}`
  if (results.length === 0) return errorText
  const suggestions = results
    .sort(([, a], [, b]) => b - a)
    .slice(0, 4)
    .map(([i]) => {
      var _context$tailwindConf

      return `${i}${
        (_context$tailwindConf = context.tailwindConfig.separator) != null
          ? _context$tailwindConf
          : ':'
      }`
    })
  const showMore = results.length > 2 && results[0][1] - results[1][1] < 0.1
  const suggestionText =
    suggestions.length > 0
      ? [
          `Did you mean ${context.color(
            suggestions.slice(0, 1).join(''),
            'success'
          )} ?`,
          showMore &&
            `More variants\n${suggestions
              .slice(1)
              .map(v => `${context.color('-', 'subdued')} ${v}`)
              .join('\n')}`,
        ]
          .filter(Boolean)
          .join('\n\n')
      : ''
  return [errorText, suggestionText].join('\n\n')
}

const validators = [
  // Validate the group class
  (pieces, context) => {
    const className = pieces.slice(-1).join('')

    if (/^!?group\/\S/.test(className)) {
      var _exec

      return `${context.color(
        `✕ ${context.color(
          className,
          'errorLight'
        )} must be added as a className:`,
        'error'
      )}\n\n<div ${context.color(
        `className="${className}"`,
        'success'
      )}>\n <div tw="group-hover/${String(
        (_exec = /\/(\w+)$/.exec(className)) == null ? void 0 : _exec[1]
      )}:bg-black" />\n</div>`
    }

    if (!pieces.includes('group')) return
    return `${context.color(
      `✕ ${context.color('group', 'errorLight')} must be added as a className:`,
      'error'
    )}\n\n<div ${context.color(
      'className="group"',
      'success'
    )}>\n <div tw="group-hover:bg-black" />\n</div>\n\nRead more at https://twinredirect.page.link/group`
  }, // Validate the peer class
  (pieces, context) => {
    const className = pieces.slice(-1).join('')

    if (/^!?peer\/\S/.test(className)) {
      var _exec2

      return `${context.color(
        `✕ ${context.color(
          className,
          'errorLight'
        )} must be added as a className:`,
        'error'
      )}\n\n<div ${context.color(
        `className="${className}"`,
        'success'
      )}>\n <div tw="peer-hover/${String(
        (_exec2 = /\/(\w+)$/.exec(className)) == null ? void 0 : _exec2[1]
      )}:bg-black" />\n</div>`
    }

    if (!pieces.includes('peer')) return
    return `${context.color(
      `✕ ${context.color('peer', 'errorLight')} must be added as a className:`,
      'error'
    )}\n\n<div ${context.color(
      'className="peer"',
      'success'
    )}>\n<div tw="peer-hover:bg-black" />\n\nRead more at https://twinredirect.page.link/peer`
  }, // Validate the opacity
  (pieces, context) => {
    var _context$tailwindConf, _context$tailwindConf2

    const className = pieces.slice(-1).join('')
    const opacityMatch = /\/(\w+)$/.exec(className)
    if (!opacityMatch) return
    const opacityConfig =
      (_context$tailwindConf =
        (_context$tailwindConf2 = context.tailwindConfig.theme) == null
          ? void 0
          : _context$tailwindConf2.opacity) != null
        ? _context$tailwindConf
        : {}
    if (opacityConfig[opacityMatch[1]]) return
    const choices = Object.entries(opacityConfig)
      .map(
        ([k, v]) =>
          `${context.color('-', 'subdued')} ${context.color(
            k,
            'success'
          )} ${context.color('>', 'subdued')} ${v}`
      )
      .join('\n')
    return `${context.color(
      `✕ ${context.color(
        className,
        'errorLight'
      )} doesn’t have an opacity from your config`,
      'error'
    )}\n\nTry one of these opacity values:\n\n${choices}`
  }, // Validate the lead class (from the official typography plugin)
  (pieces, context) => {
    if (!pieces.includes('lead')) return
    return `${context.color(
      `✕ ${context.color('lead', 'errorLight')} must be added as a className:`,
      'error'
    )}\n\n<div ${context.color('className="lead"', 'success')}>...</div>`
  }, // Validate the not-prose class (from the official typography plugin)
  (pieces, context) => {
    if (!pieces.includes('not-prose')) return
    return `${context.color(
      `✕ ${context.color(
        'not-prose',
        'errorLight'
      )} must be added as a className:`,
      'error'
    )}\n\n<div tw="prose">\n <div ${context.color(
      'className="not-prose"',
      'success'
    )}>...</div>\n</div>`
  }, // Validate the dark class
  (pieces, context) => {
    const className = pieces.slice(-1).join('')
    if (className !== 'dark') return
    return `${context.color(
      `✕ ${context.color('dark', 'errorLight')} must be added as a className:`,
      'error'
    )}\n\nAdd dark in a ${context.color(
      'className',
      'success'
    )}:\n<body ${context.color(
      'className="dark"',
      'success'
    )}>...</body>\n\nOr as a ${context.color(
      'variant',
      'success'
    )}:\n<div tw="${context.color(
      'dark',
      'success'
    )}:(bg-white text-black)" />\n\nRead more at https://twinredirect.page.link/darkLightMode`
  }, // Validate the light class
  (pieces, context) => {
    const className = pieces.slice(-1).join('')
    if (className !== 'light') return
    return `${context.color(
      `✕ ${context.color('light', 'errorLight')} must be added as a className:`,
      'error'
    )}\n\nAdd light in a ${context.color(
      'className',
      'success'
    )}:\n<body ${context.color(
      'className="light"',
      'success'
    )}>...</body>\n\nOr as a ${context.color(
      'variant',
      'success'
    )}:\n<div tw="${context.color(
      'light',
      'success'
    )}:(bg-white text-black)" />\n\nRead more at https://twinredirect.page.link/darkLightMode`
  }, // Validate any variants
  (pieces, context) => {
    const variants = pieces.slice(0, -1)
    const variantError = variants
      .map(variant => validateVariants(variant, context))
      .filter(Boolean)
    if (variantError.length === 0) return
    return variantError[0]
  }, // If prefix is set, validate the class for the prefix
  (pieces, context) => {
    const { prefix } = context.tailwindConfig
    const className = pieces.slice(-1).join('')
    if (prefix && !className.startsWith(prefix))
      return `${context.color(
        `✕ ${context.color(
          className,
          'errorLight'
        )} doesn’t have the right prefix`,
        'error'
      )}\n\nAdd the ${context.color(prefix, 'success')} prefix to the class`
  },
]

const RATING_MINIMUM = 0.2

function rateCandidate(classData, className, matchee) {
  var _ref, _ref2

  const [classEnd, value] = classData
  const candidate = `${[className, classEnd === 'DEFAULT' ? '' : classEnd]
    .filter(Boolean)
    .join('-')}`
  const rating = Number(src.compareTwoStrings(matchee, candidate))
  if (rating < RATING_MINIMUM) return
  const classValue = `${String(
    (_ref =
      (_ref2 =
        typeof value === 'string' && (value.length === 0 ? `''` : value)) !=
      null
        ? _ref2
        : Array.isArray(value) && value.join(', ')) != null
      ? _ref
      : value
  )}${classEnd === 'DEFAULT' ? ' (DEFAULT)' : ''}`
  return [rating, candidate, classValue]
}

function extractCandidates(candidates, matchee) {
  const results = []

  for (const [className, classOptionSet] of candidates) {
    for (const classOption of classOptionSet) {
      const { options } = classOption[0]

      if (options != null && options.values) {
        // Dynamic classes like mt-xxx, bg-xxx
        for (const value of Object.entries(
          options == null ? void 0 : options.values
        )) {
          const rated = rateCandidate(value, className, matchee) // eslint-disable-next-line max-depth

          if (rated) results.push(rated)
        }
      } else {
        // Non-dynamic classes like fixed, block
        const rated = rateCandidate(['', className], className, matchee)
        if (rated) results.push(rated)
      }
    }
  }

  return results
}

function getClassSuggestions(matchee, context) {
  var _ref3

  const { color } = context
  const candidates = extractCandidates(context.candidates, matchee)
  const errorText = `${context.color(
    `✕ ${context.color(matchee, 'errorLight')} was not found`,
    'error'
  )}`
  if (candidates.length === 0) return errorText
  candidates.sort(([a], [b]) => b - a)
  const [firstSuggestion, secondSuggestion = []] = candidates
  const [firstRating, firstCandidate, firstClassValue] = firstSuggestion
  const [secondRating] = secondSuggestion
  const hasWinningSuggestion =
    (_ref3 =
      secondSuggestion.length > 0 && firstRating - secondRating > 0.12) != null
      ? _ref3
      : false

  if (candidates.length === 1 || hasWinningSuggestion) {
    const valueText =
      firstClassValue === firstCandidate ? '' : ` (${firstClassValue})`
    return [
      errorText,
      `Did you mean ${color(firstCandidate, 'success')} ?${valueText}`,
    ].join('\n\n')
  }

  const suggestions = candidates
    .slice(0, context.suggestionNumber)
    .map(
      ([, suggestion, value]) =>
        `${color('-', 'subdued')} ${color(suggestion, 'highlight')} ${
          value === 'false' ? '' : `${color('>', 'subdued')} ${value}`
        }`
    )
  return [errorText, 'Try one of these classes:', suggestions.join('\n')].join(
    '\n\n'
  )
}

const colors = {
  error: chalk__default['default'].hex('#ff8383'),
  errorLight: chalk__default['default'].hex('#ffd3d3'),
  warn: chalk__default['default'].yellowBright,
  success: chalk__default['default'].greenBright,
  highlight: chalk__default['default'].yellowBright,
  subdued: chalk__default['default'].hex('#999'),
}

function makeColor(hasColor) {
  return (message, type = 'error') => {
    if (!hasColor) return message
    return colors[type](message)
  }
}

function extractClassCandidates(tailwindContext) {
  const candidates = new Set()

  for (const candidate of tailwindContext.candidateRuleMap) {
    if (String(candidate[0]) !== '*') candidates.add(candidate)
  }

  return candidates
}
function extractVariantCandidates(tailwindContext) {
  const candidates = new Set()

  for (const candidate of tailwindContext.variantMap) {
    if (candidate[0]) candidates.add(candidate[0])
  }

  return candidates
}

function getPackageVersions() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires, unicorn/prefer-module
  const packageJson = require('./package.json')

  const versions = {
    twinVersion: packageJson.version,
  }
  return versions
}

const ALL_SPACE_IDS = /{{SPACE}}/g
const OPTION_DEFAULTS = {
  CustomError: Error,
  tailwindContext: undefined,
  tailwindConfig: undefined,
  hasLogColors: true,
  suggestionNumber: 5,
}

function getVariantSuggestions(variants, className, context) {
  const coreContext = createCoreContext({
    tailwindConfig: context == null ? void 0 : context.tailwindConfig,
    CustomError: babelPluginMacros.MacroError,
  })
  const { unmatched } = getStyles(className, coreContext)
  if (unmatched.length > 0) return
  const unmatchedVariants = variants.filter(v => {
    if (v.startsWith('[')) return v
    return !context.variants.has(v)
  })
  if (unmatchedVariants.length === 0) return
  const problemVariant = unmatchedVariants[0]
  return [
    `${context.color(
      `✕ Variant ${context.color(problemVariant, 'errorLight')} ${
        problemVariant.startsWith('[') ? 'can’t be used' : 'was not found'
      }`
    )}`,
  ].join('\n\n')
}

function getClassError(rawClass, context) {
  var _context$tailwindConf

  const input = rawClass.replace(ALL_SPACE_IDS, ' ')
  const classPieces = [
    ...splitAtTopLevelOnly(
      input,
      (_context$tailwindConf = context.tailwindConfig.separator) != null
        ? _context$tailwindConf
        : ':'
    ),
  ]

  for (const validator of validators) {
    const error = validator(classPieces, context)
    if (error) return error
  }

  const className = classPieces.slice(-1).join('')
  const variants = classPieces.slice(0, -1) // Check if variants or classes with match issues

  if (variants.length > 0) {
    const variantSuggestions = getVariantSuggestions(
      variants,
      className,
      context
    )
    if (variantSuggestions) return variantSuggestions
  }

  return getClassSuggestions(className, context)
}

function createErrorContext(color, context) {
  return {
    color,
    candidates: extractClassCandidates(context.tailwindContext),
    variants: extractVariantCandidates(context.tailwindContext),
    suggestionNumber: context.suggestionNumber,
    CustomError: context.CustomError,
    tailwindConfig: context.tailwindConfig,
    tailwindContext: context.tailwindContext,
  }
}

function getSuggestions(classList, options) {
  const context = { ...OPTION_DEFAULTS, ...options }
  const color = makeColor(context.hasLogColors)
  const classErrorContext = createErrorContext(color, context)
  const errorText = classList
    .map(c => getClassError(c, classErrorContext))
    .join('\n\n')
  const { twinVersion } = getPackageVersions()
  const helpText = [
    `${twinVersion ? `twin.macro@${twinVersion}` : 'twinVersion'}`,
    `https://twinredirect.page.link/docs`,
    `https://tailwindcss.com/docs`,
  ].join('\n')
  throw new context.CustomError(
    `\n\n${errorText}\n\n${color(helpText, 'subdued')}\n`
  )
}

const SPACE_ID = '_'
const EXTRA_WHITESPACE = /\s\s+/g
const LINEFEED = /\n/g

function formatProp(classes) {
  return classes // Normalize spacing
    .replace(EXTRA_WHITESPACE, ' ') // Remove newline characters
    .replace(LINEFEED, ' ') // Replace the space id
    .replace(SPACE_ID, ' ')
    .trim()
}

function addDataTwPropToPath({
  t,
  attributes,
  rawClasses,
  path,
  state,
  coreContext,
  propName = 'data-tw',
}) {
  const dataTwPropAllEnvironments =
    propName === 'data-tw' && coreContext.twinConfig.dataTwProp === 'all'
  const dataCsPropAllEnvironments =
    propName === 'data-cs' && coreContext.twinConfig.dataCsProp === 'all'
  if (!state.isDev && !dataTwPropAllEnvironments && !dataCsPropAllEnvironments)
    return
  if (propName === 'data-tw' && !coreContext.twinConfig.dataTwProp) return
  if (propName === 'data-cs' && !coreContext.twinConfig.dataCsProp) return // A for in loop looping over attributes and removing the one we want

  for (const p of attributes) {
    if (p.type === 'JSXSpreadAttribute') continue
    const nodeName = p.node
    if (nodeName != null && nodeName.name && nodeName.name.name === propName)
      p.remove()
  }

  const classes = formatProp(rawClasses) // Add the attribute

  path.insertAfter(
    t.jsxAttribute(t.jsxIdentifier(propName), t.stringLiteral(classes))
  )
}

function addDataPropToExistingPath({
  t,
  attributes,
  rawClasses,
  path,
  state,
  coreContext,
  propName = 'data-tw',
}) {
  const dataTwPropAllEnvironments =
    propName === 'data-tw' && coreContext.twinConfig.dataTwProp === 'all'
  const dataCsPropAllEnvironments =
    propName === 'data-cs' && coreContext.twinConfig.dataCsProp === 'all'
  if (!state.isDev && !dataTwPropAllEnvironments && !dataCsPropAllEnvironments)
    return
  if (propName === 'data-tw' && !coreContext.twinConfig.dataTwProp) return
  if (propName === 'data-cs' && !coreContext.twinConfig.dataCsProp) return // Append to the existing debug attribute

  const dataProperty = attributes.find(p => {
    var _p$node

    return (
      ((_p$node = p.node) == null ? void 0 : _p$node.name) &&
      p.node.name.name === propName
    )
  })

  if (dataProperty) {
    try {
      // Existing data prop
      if (dataProperty.node.value.value) {
        dataProperty.node.value.value = `${[
          dataProperty.node.value.value,
          rawClasses,
        ]
          .filter(Boolean)
          .join(' | ')}`
        return
      } // New data prop

      const attribute = dataProperty.node.value // @ts-expect-error Setting value on target

      attribute.expression.value = `${[
        // @ts-expect-error Okay with value not on all expression types
        dataProperty.node.value.expression.value,
        rawClasses,
      ]
        .filter(Boolean)
        .join(' | ')}`
    } catch (_) {}

    return
  }

  const classes = formatProp(rawClasses) // Add a new attribute

  path.pushContainer(
    // @ts-expect-error Key is never
    'attributes',
    t.jSXAttribute(
      t.jSXIdentifier(propName),
      t.jSXExpressionContainer(t.stringLiteral(classes))
    )
  )
}

// eslint-disable-next-line import/no-relative-parent-imports

function moveTwPropToStyled(params) {
  const { jsxPath, astStyles } = params
  makeStyledComponent({ ...params, secondArg: astStyles }) // Remove the tw attribute

  const tagAttributes = jsxPath.node.attributes
  const twAttributeIndex = tagAttributes.findIndex(
    n => n.type === 'JSXAttribute' && n.name && n.name.name === 'tw'
  )
  if (twAttributeIndex < 0) return
  jsxPath.node.attributes.splice(twAttributeIndex, 1)
}

function mergeIntoCssAttribute({ t, path, astStyles, cssAttribute }) {
  if (!cssAttribute) return // The expression is the value as a NodePath

  const attributeValuePath = cssAttribute.get('value') // If it's not {} or "", get out of here

  if (
    !attributeValuePath ||
    (!attributeValuePath.isJSXExpressionContainer() &&
      !attributeValuePath.isStringLiteral())
  )
    return
  const existingCssAttribute = attributeValuePath.isStringLiteral()
    ? attributeValuePath // @ts-expect-error get doesn’t exist on the types
    : attributeValuePath.get('expression')
  const attributeNames = getAttributeNames(path)
  const isBeforeCssAttribute =
    attributeNames.indexOf('tw') - attributeNames.indexOf('css') < 0

  if (existingCssAttribute.isArrayExpression()) {
    // The existing css prop is an array, eg: css={[...]}
    if (isBeforeCssAttribute) {
      const attribute = existingCssAttribute // @ts-expect-error never in arg0?

      attribute.unshiftContainer('elements', astStyles)
    } else {
      const attribute = existingCssAttribute // @ts-expect-error never in arg0?

      attribute.pushContainer('elements', astStyles)
    }
  } else {
    // css prop is either:
    // TemplateLiteral
    // <div css={`...`} tw="..." />
    // or an ObjectExpression
    // <div css={{ ... }} tw="..." />
    // or ArrowFunctionExpression/FunctionExpression
    // <div css={() => (...)} tw="..." />
    const existingCssAttributeNode = existingCssAttribute.node // The existing css prop is an array, eg: css={[...]}

    const styleArray = isBeforeCssAttribute
      ? [astStyles, existingCssAttributeNode]
      : [existingCssAttributeNode, astStyles]
    const arrayExpression = t.arrayExpression(styleArray)
    const { parent } = existingCssAttribute
    const replacement =
      parent.type === 'JSXAttribute'
        ? t.jsxExpressionContainer(arrayExpression)
        : arrayExpression
    existingCssAttribute.replaceWith(replacement)
  }
}

function handleTwProperty({ path, t, program, state, coreContext }) {
  if (!path.node || path.node.name.name !== 'tw') return
  state.hasTwAttribute = true
  const nodeValue = path.node.value
  if (!nodeValue) return
  const nodeExpression = nodeValue.expression // Handle `tw={"block"}`

  const expressionValue =
    nodeExpression &&
    nodeExpression.type === 'StringLiteral' &&
    nodeExpression.value
  if (expressionValue === '') return // Allow `tw={""}`
  // Feedback for unsupported usage

  if (nodeExpression)
    coreContext.assert(
      Boolean(expressionValue),
      ({ color }) =>
        `${color(
          `✕ Only plain strings can be used with the "tw" prop`
        )}\n\nTry using it like this: ${color(
          `<div tw="text-black" />`,
          'success'
        )} or ${color(
          `<div tw={"text-black"} />`,
          'success'
        )}\n\nRead more at https://twinredirect.page.link/template-literals`
    )
  const rawClasses = expressionValue || nodeValue.value || ''
  const { styles, unmatched } = getStyles(rawClasses, coreContext)

  if (unmatched.length > 0) {
    getSuggestions(unmatched, {
      CustomError: coreContext.CustomError,
      tailwindContext: coreContext.tailwindContext,
      tailwindConfig: coreContext.tailwindConfig,
      hasLogColors: coreContext.twinConfig.hasLogColors,
    })
    return
  }

  const astStyles = astify(isEmpty(styles) ? {} : styles, t)
  const jsxPath = getParentJSX(path)
  const attributes = jsxPath.get('attributes')
  const { attribute: cssAttribute } = getCssAttributeData(attributes)

  if (coreContext.twinConfig.moveTwPropToStyled) {
    moveTwPropToStyled({
      astStyles,
      jsxPath,
      t,
      program,
      state,
      coreContext,
    })
    addDataTwPropToPath({
      t,
      attributes,
      rawClasses,
      path,
      state,
      coreContext,
    })
    return
  }

  if (!cssAttribute) {
    // Replace the tw prop with the css prop
    path.replaceWith(
      t.jsxAttribute(
        t.jsxIdentifier('css'),
        t.jsxExpressionContainer(astStyles)
      )
    )
    addDataTwPropToPath({
      t,
      attributes,
      rawClasses,
      path,
      state,
      coreContext,
    })
    return
  } // Merge tw styles into an existing css prop

  mergeIntoCssAttribute({
    cssAttribute: cssAttribute,
    path: jsxPath,
    astStyles,
    t,
  })
  path.remove() // remove the tw prop

  addDataPropToExistingPath({
    t,
    attributes,
    rawClasses,
    path: jsxPath,
    coreContext,
    state,
  })
}

function handleTwFunction({ references, t, state, coreContext }) {
  const defaultImportReferences = references.default || references.tw || []
  defaultImportReferences.forEach(path => {
    /**
     * Gotcha: After twin changes a className/tw/cs prop path then the reference
     * becomes stale and needs to be refreshed with crawl()
     */
    const { parentPath } = path
    if (!parentPath.isTaggedTemplateExpression()) path.scope.crawl()
    const parent = path.findParent(x => x.isTaggedTemplateExpression())
    if (!parent) return // Check if the style attribute is being used

    if (!coreContext.twinConfig.allowStyleProp) {
      const jsxAttribute = parent.findParent(x => x.isJSXAttribute())
      const attributeName = // @ts-expect-error No `get` on resulting path
        jsxAttribute && jsxAttribute.get('name').get('name').node
      coreContext.assert(
        attributeName !== 'style',
        ({ color }) =>
          `${color(
            `✕ Tailwind styles shouldn’t be added within a \`style={...}\` prop`
          )}\n\nUse the tw or css prop instead: ${color(
            '<div tw="" />',
            'success'
          )} or ${color(
            '<div css="" />',
            'success'
          )}\n\nDisable this error by adding this in your twin config: \`{ "allowStyleProp": true }\`\nRead more at https://twinredirect.page.link/style-prop`
      )
    }

    const parsed = parseTte(parent, {
      t,
      state,
    })
    if (!parsed) return
    const rawClasses = parsed.string // Add tw-prop for css attributes

    const jsxPath = path.findParent(p => p.isJSXOpeningElement())

    if (jsxPath) {
      const attributes = jsxPath.get('attributes')
      const pathData = {
        t,
        attributes,
        rawClasses,
        path: jsxPath,
        coreContext,
        state,
      }
      addDataPropToExistingPath(pathData)
    }

    const { styles, unmatched } = getStyles(rawClasses, coreContext)

    if (unmatched.length > 0) {
      getSuggestions(unmatched, {
        CustomError: coreContext.CustomError,
        tailwindContext: coreContext.tailwindContext,
        tailwindConfig: coreContext.tailwindConfig,
        hasLogColors: coreContext.twinConfig.hasLogColors,
      })
      return
    }

    const astStyles = astify(isEmpty(styles) ? {} : styles, t)
    replaceWithLocation(parsed.path, astStyles)
  })
}

/* eslint-disable @typescript-eslint/no-unsafe-call */

function handleCsProperty({ path, t, state, coreContext }) {
  if (coreContext.twinConfig.disableCsProp) return
  if (!path.node || path.node.name.name !== 'cs') return
  const nodeValue = path.node.value
  const nodeExpression = nodeValue.expression // Allow cs={"property[value]"}

  const expressionValue =
    nodeExpression &&
    nodeExpression.type === 'StringLiteral' &&
    nodeExpression.value
  if (nodeExpression)
    coreContext.assert(
      Boolean(expressionValue),
      ({ color }) =>
        `${color(
          `✕ Only complete classes can be used with the "cs" prop`
        )}\n\nTry using it like this: ${color(
          '<div cs="maxWidth[30rem]" />',
          'success'
        )}\n\nRead more at https://twinredirect.page.link/cs-classes`
    )
  const rawClasses = expressionValue || nodeValue.value || ''
  const { styles } = getStyles(rawClasses, {
    isShortCssOnly: true,
    ...coreContext,
  })
  const astStyles = astify(isEmpty(styles) ? {} : styles, t)
  const jsxPath = getParentJSX(path)
  const attributes = jsxPath.get('attributes')
  const { attribute: cssAttribute } = getCssAttributeData(attributes)

  if (!cssAttribute) {
    // Replace the tw prop with the css prop
    path.replaceWith(
      t.jsxAttribute(
        t.jsxIdentifier('css'),
        t.jsxExpressionContainer(astStyles)
      )
    )
    addDataTwPropToPath({
      t,
      attributes,
      rawClasses,
      path,
      state,
      coreContext,
      propName: 'data-cs',
    })
    return
  } // The expression is the value as a NodePath

  const attributeValuePath = cssAttribute.get('value') // If it's not {} or "", get out of here

  if (
    !attributeValuePath || // @ts-expect-error The type checking functions don't exist on NodePath
    (!attributeValuePath.isJSXExpressionContainer() && // @ts-expect-error The type checking functions don't exist on NodePath
      !attributeValuePath.isStringLiteral())
  )
    return // @ts-expect-error The type checking functions don't exist on NodePath

  const existingCssAttribute = attributeValuePath.isStringLiteral()
    ? attributeValuePath // @ts-expect-error get doesn’t exist on the types
    : attributeValuePath.get('expression')
  const attributeNames = getAttributeNames(jsxPath)
  const isBeforeCssAttribute =
    attributeNames.indexOf('cs') - attributeNames.indexOf('css') < 0

  if (existingCssAttribute.isArrayExpression()) {
    // The existing css prop is an array, eg: css={[...]}
    if (isBeforeCssAttribute) {
      // @ts-expect-error unshiftContainer doesn't exist on NodePath
      existingCssAttribute.unshiftContainer('elements', astStyles)
    } else {
      // @ts-expect-error pushContainer doesn't exist on NodePath
      existingCssAttribute.pushContainer('elements', astStyles)
    }
  } else {
    // css prop is either:
    // TemplateLiteral
    // <div css={`...`} cs="..." />
    // or an ObjectExpression
    // <div css={{ ... }} cs="..." />
    // or ArrowFunctionExpression/FunctionExpression
    // <div css={() => (...)} cs="..." />
    const existingCssAttributeNode = existingCssAttribute.node // The existing css prop is an array, eg: css={[...]}

    const styleArray = isBeforeCssAttribute
      ? [astStyles, existingCssAttributeNode]
      : [existingCssAttributeNode, astStyles]
    const arrayExpression = t.arrayExpression(styleArray)
    const { parent } = existingCssAttribute
    const replacement =
      parent.type === 'JSXAttribute'
        ? t.jsxExpressionContainer(arrayExpression)
        : arrayExpression
    existingCssAttribute.replaceWith(replacement)
  }

  path.remove() // remove the cs prop

  addDataPropToExistingPath({
    t,
    attributes,
    rawClasses,
    path: jsxPath,
    state,
    coreContext,
    propName: 'data-cs',
  })
}

// eslint-disable-next-line import/no-relative-parent-imports

function makeJsxAttribute([key, value], t) {
  return t.jsxAttribute(t.jsxIdentifier(key), t.jsxExpressionContainer(value))
}

function handleClassNameProperty({ path, t, state, coreContext }) {
  if (!coreContext.twinConfig.includeClassNames) return
  if (path.node.name.name !== 'className') return
  const nodeValue = path.node.value
  if (!nodeValue) return // Ignore className if it cannot be resolved

  if (nodeValue.expression) return
  const rawClasses = nodeValue.value
  if (!rawClasses) return
  const { styles, unmatched, matched } = getStyles(rawClasses, {
    ...coreContext,
    isSilent: true,
  })
  if (matched.length === 0) return
  const astStyles = astify(isEmpty(styles) ? {} : styles, t) // When classes can't be matched we add them back into the className (it exists as a few properties)

  const unmatchedClasses = unmatched.join(' ')
  if (!path.node.value) return
  path.node.value.value = unmatchedClasses

  if (path.node.value.extra) {
    path.node.value.extra.rawValue = unmatchedClasses
    path.node.value.extra.raw = `"${unmatchedClasses}"`
  }

  const jsxPath = getParentJSX(path)
  const attributes = jsxPath.get('attributes')
  const { attribute: cssAttribute } = getCssAttributeData(attributes)

  if (!cssAttribute) {
    const attribute = makeJsxAttribute(['css', astStyles], t)

    if (unmatchedClasses) {
      path.insertAfter(attribute)
    } else {
      path.replaceWith(attribute)
    }

    const pathParameters = {
      t,
      path,
      state,
      attributes,
      coreContext,
      rawClasses: matched.join(' '),
    }
    addDataTwPropToPath(pathParameters)
    return
  }

  const cssExpression = cssAttribute.get('value').get('expression')
  const attributeNames = getAttributeNames(jsxPath)
  const isBeforeCssAttribute =
    attributeNames.indexOf('className') - attributeNames.indexOf('css') < 0

  if (cssExpression.isArrayExpression()) {
    // The existing css prop is an array, eg: css={[...]}
    if (isBeforeCssAttribute) {
      cssExpression.unshiftContainer('elements', astStyles)
    } else {
      cssExpression.pushContainer('elements', astStyles)
    }
  } else {
    // The existing css prop is not an array, eg: css={{ ... }} / css={`...`}
    const existingCssAttribute = cssExpression.node
    coreContext.assert(Boolean(existingCssAttribute), ({ color }) =>
      color(
        `✕ An empty css prop (css="") isn’t supported alongside the className prop`
      )
    )
    const styleArray = isBeforeCssAttribute
      ? [astStyles, existingCssAttribute]
      : [existingCssAttribute, astStyles]
    cssExpression.replaceWith(t.arrayExpression(styleArray))
  }

  if (!unmatchedClasses) path.remove()
  addDataPropToExistingPath({
    t,
    attributes,
    rawClasses: matched.join(' '),
    path: jsxPath,
    state,
    coreContext,
  })
}

// eslint-disable-next-line import/no-relative-parent-imports
const macroTasks = [
  handleTwFunction,
  handleGlobalStylesFunction,
  updateStyledReferences,
  handleStyledFunction,
  updateCssReferences,
  handleThemeFunction,
  handleScreenFunction,
  addStyledImport,
  addCssImport, // Gotcha: Must be after addStyledImport or issues with theme`` style transpile
]

function twinMacro(params) {
  var _params$state$filenam, _params$state$file$op

  const t = params.babel.types
  const program = params.state.file.path
  const isDev =
    process.env.NODE_ENV === 'development' ||
    process.env.NODE_ENV === 'dev' ||
    false
  const coreContext = createCoreContext({
    isDev,
    config: params.config,
    filename:
      (_params$state$filenam = params.state.filename) != null
        ? _params$state$filenam
        : '',
    sourceRoot:
      (_params$state$file$op = params.state.file.opts.sourceRoot) != null
        ? _params$state$file$op
        : '',
    CustomError: babelPluginMacros.MacroError,
  })
  validateImports(params.references, coreContext)
  const state = {
    isDev,
    babel: params.babel,
    config: params.config,
    tailwindConfigIdentifier: generateUid('tailwindConfig', program),
    tailwindUtilsIdentifier: generateUid('tailwindUtils', program),
    styledIdentifier: undefined,
    cssIdentifier: undefined,
    hasCssAttribute: false,
  }
  const handlerParameters = {
    t,
    program,
    state,
    coreContext,
  }
  program.traverse({
    ImportDeclaration(path) {
      setStyledIdentifier({ ...handlerParameters, path })
      setCssIdentifier({ ...handlerParameters, path })
    },

    JSXElement(path) {
      const jsxAttributes = getJsxAttributes(path)
      const { index, hasCssAttribute } = getCssAttributeData(jsxAttributes)
      state.hasCssAttribute = state.hasCssAttribute || hasCssAttribute
      const attributePaths = index > 1 ? jsxAttributes.reverse() : jsxAttributes

      for (const path of attributePaths) {
        handleClassNameProperty({ ...handlerParameters, path })
        handleTwProperty({ ...handlerParameters, path })
        handleCsProperty({ ...handlerParameters, path })
      }

      if (hasCssAttribute)
        convertHtmlElementToStyled({ ...handlerParameters, path })
    },
  })
  if (state.styledIdentifier === undefined)
    state.styledIdentifier = generateUid('styled', program)
  if (state.cssIdentifier === undefined)
    state.cssIdentifier = generateUid('css', program)

  for (const task of macroTasks) {
    // @ts-expect-error TOFIX: Adjust types for altered state
    task({ ...handlerParameters, references: params.references })
  }

  program.scope.crawl()
}

var macro = babelPluginMacros.createMacro(twinMacro, {
  configName: 'twin',
})

module.exports = macro
//# sourceMappingURL=macro.js.map
