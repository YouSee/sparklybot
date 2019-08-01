/* eslint-disable */

module.exports = function(babel) {
  const t = babel.types

  const appendService = (sceneName = 'scene') =>
    t.callExpression(
      t.memberExpression(
        t.callExpression(
          t.memberExpression(
            t.identifier(sceneName),
            t.identifier('getService'),
          ),
          [t.stringLiteral('.sparklybot')],
        ),
        t.identifier('registerScene'),
      ),
      [t.identifier(sceneName)],
    )

  const hasSceneArgument = args => {
    if (!args || !args.length) return false
    if (args.length === 1 && args[0].type === 'ObjectExpression') {
      if (args[0].properties && args[0].properties.length) {
        return args[0].properties.some(
          property =>
            property.value && property.value.value === 'px:scene.1.js',
        )
      }
    }
    return args[0].value === 'px:scene.1.js'
  }

  const getSceneNameFromParams = (argumentType, params) => {
    if (!params || !params.length) return undefined
    if (params.length === 1 && argumentType === 'ObjectExpression') {
      return `${params[0].name}.scene`
    }
    if (params.length === 1) return params[0].name
    return undefined
  }

  return {
    visitor: {
      CallExpression(path) {
        const { node } = path

        if (
          node.arguments &&
          node.arguments.length &&
          node.arguments[0].value === 'onKeyDown'
        ) {
          if (
            !node.callee ||
            !node.callee.property ||
            node.callee.property.name !== 'on'
          )
            return
          node.callee = t.memberExpression(
            t.memberExpression(t.identifier('global'), t.identifier('process')),
            t.identifier('on'),
          )
        }

        // px.import with scene
        if (
          node.arguments &&
          node.arguments.length &&
          hasSceneArgument(node.arguments)
        ) {
          if (
            path.parentPath &&
            path.parentPath.parentPath &&
            path.parentPath.parentPath.node
          ) {
            const parentNode = path.parentPath.parentPath.node
            if (
              parentNode.arguments &&
              parentNode.arguments.length &&
              parentNode.arguments.length === 1
            ) {
              parentNode.arguments[0].body.body.push(
                appendService(
                  getSceneNameFromParams(
                    node.arguments[0].type,
                    parentNode.arguments[0].params,
                  ),
                ),
              )
            }
          }
        }
      },
      YieldExpression(path) {
        const { node } = path

        // Check if px.import has been used with await/generator
        if (node.argument && node.argument.type === 'CallExpression') {
          const { argument } = node
          if (
            argument.arguments &&
            argument.arguments.length &&
            argument.arguments.some(arg => arg.value === 'px:scene.1.js')
          ) {
            const parentNode = path.parentPath.node
            const blockNode =
              path.parentPath &&
              path.parentPath.parentPath &&
              path.parentPath.parentPath.parentPath.node

            if (
              blockNode &&
              blockNode.body &&
              parentNode.id &&
              parentNode.id.type === 'Identifier'
            ) {
              const identifierValue = parentNode.id.name
              blockNode.body.push(appendService(identifierValue))
            }
          }
        }
      },
    },
  }
}
