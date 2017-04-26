redux-async-connect 解析 v1.0.0 rc-4
=======================
asyncConnect 最终调用的是 react-redux 中的connect  
使用方式－：  
```
asyncConnect(mapStateToProps)(ReactComponent)
```
使用方式二： 
```
@asyncConnect(mapStateToProps)
class App extends Component {
	
}
```
## 客户端使用范例
```
// 1. Connect your data, similar to react-redux @connect
// asyncConnect 最终调用的是 react-redux 中的connect
// 核心逻辑 
//  Component.reduxAsyncConnect=asyncItems 
//  connect({})(Component);
@asyncConnect([{
  lunch: (params, helpers) => Promise.resolve({id: 1, name: 'Borsch'})
}])
class App extends React.Component {
  render() {
    // 2. access data as props
    const lunch = this.props.lunch
    return (
      <div>{lunch.name}</div>
    )
  }
}

// 3. Connect redux async reducer
const store = createStore(combineReducers({reduxAsyncConnect}), window.__data);

// 4. Render `Router` with ReduxAsyncConnect middleware
render((
  <Provider store={store} key="provider">
    <Router render={(props) => <ReduxAsyncConnect {...props}/>} history={browserHistory}>
      <Route path="/" component={App}/>
    </Router>
  </Provider>
), el)
```
## state.reduxAsyncConnect 结构
使用redux-async-connect会在state中出现reduxAsyncConnect属性，保存该组件使用到的数据。
为什么会出现reduxAsyncConnect属性呢？源于使用时下面这行代码,使用实例的第三步
```
const store = createStore(combineReducers({reduxAsyncConnect}));
```