## 例一

```
Tabs.js

import React from 'react'
import PropTypes from 'prop-types'

export class Tabs extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      activeIndex: props.activeIndex
    }
  }
  tabChange = (event, index) => {
    event.preventDefault()
    this.setState({
      activeIndex: index
    })
    this.props.onTabChange(index)
  }
  render() {
    const { children } = this.props
    const { activeIndex } = this.state
    return ( 
      <ul className="nav nav-tabs nav-fill my-4">
        {React.Children.map(children, (child, index) => {
          const activeClassName = (activeIndex === index) ? 'nav-link active' : 'nav-link'
          return (
            <li className="nav-item">
              <a
                onClick={(event) => { this.tabChange(event, index)}}
                className={activeClassName}
                role="button"
              >
                {child}
              </a>
            </li>
          )
        })}
      </ul>
    )
  }
}
Tabs.propTypes = {
  activeIndex: PropTypes.number.isRequired,
  onTabChange: PropTypes.func.isRequired,
}

export const Tab = ({ children }) => 
<React.Fragment>{children}</React.Fragment>

```

```
使用方法

<Tabs activeIndex={tabIndex} onTabChange={this.changeView}>
    <Tab>
        列表模式
    </Tab>
    <Tab>
        图标模式
    </Tab>
</Tabs>
```

## 例二

```
index.jsx

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {Steps, Step} from './Steps';

function App() {
    return (
        <div>
        <Steps currentStep={1}>  //完成相应的步骤，改变currentStep的值。如，完成第一步currentStep赋值为1，完成第二部赋值为2
            <Step />
            <Step />
            <Step />
            </Steps>
        </div>
    );
}
ReactDOM.render(<App />, document.getElementById('root'));
 

Steps.jsx

import * as React from 'react';
import './step.less';

function Steps({currentStep, children}) {
    return (
        <div>
         {React.Children.map(children, (child, index) => {
            return React.cloneElement(child, {
              index: index,
              currentStep: currentStep
            });
         })}
    　　</div>
    );
}

function Step({index, currentStep}: any) {
    return <div className={`indicator${currentStep >= index + 1 ? ' active' : ''}`} />;
}
export {Steps, Step};
```