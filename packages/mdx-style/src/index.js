import React from 'react'
import { MDXProvider } from '@mdx-js/tag'
import objectStyle from 'object-style'

export { withMDXComponents as withComponents } from '@mdx-js/tag/dist/mdx-provider'

export const MDXStyleContext = React.createContext({})

export const join = (...args) => args.filter(Boolean).join(' ')
export const createComponent = (tag, className) =>
  props => React.createElement(tag, {
    ...props,
    className: join(className, props.className)
  })

// is this safe in IE11?
// const filterUnique = (value, i, self) => self.indexOf(value) === i
const unique = arr => [...new Set(arr)]

export class MDXStyle extends React.Component {
  static defaultProps = {
    components: {},
    css: {}
  }

  createComponents = (props) => {
    const styles = []
    const components = Object.keys(props.css)
      .reduce((a, key) => {
        const style = props.css[key]
        const rule = objectStyle(style)
        styles.push(...rule.rules)

        if (key === 'root') {
          const component = createComponent('div', rule.className)
          return { ...a, [key]: component }
        }

        const base = key === 'pre' ? key : props.components[key] || key
        const component = createComponent(base, rule.className)

        return { ...a, [key]: component }
      }, props.components)

    if (props.components.pre) {
      components.inlineCode = components.code
      const pre = props.components.pre
      const Pre = components.pre
      components.code = props => React.createElement(pre, {
        pre: props => <Pre {...props} />,
        ...props
      })
      components.pre = props => props.children
    }

    return {
      components,
      styles: unique(styles).join('')
    }
  }

  render () {
    const {
      css,
      components: _components,
      ...props
    } = this.props
    const { components, styles } = this.createComponents(this.props)
    const Root = components.root || (props => <div {...props} />)

    return (
      <MDXProvider components={components}>
        <React.Fragment>
          <style
            dangerouslySetInnerHTML={{
              __html: styles
            }}
          />
          <Root {...props} />
        </React.Fragment>
      </MDXProvider>
    )
  }
}

export default MDXStyle
