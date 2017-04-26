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
@asyncConnect([{
  lunch: (params, helpers) => Promise.resolve({id: 1, name: 'Borsch'})
}])
class App extends React.Component {
  render() {
    // 2. access data as props
    // 注意这里是直接访问数据了
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
最终达到的效果就是2步中看到的，魔法是如何实现的呢?   
第1步因为配置项中没有key属性，查看源码发现处理逻辑很简单就是  
```
Component.reduxAsyncConnect=asyncItems 
connect({})(Component);
```
第3步也没得说，就是在state中增加了reduxAsyncConnect属性，保存组件需要的数据  
第4步就应该好好研究一下啦！  
查看Router API https://github.com/ReactTraining/react-router/blob/v2.8.1/docs/API.md#router    
对render(props)的解释，在Route组件渲染之前，第三方库想参与rendering过程，可以使用该接口。默认值是    
```
render={(props) => <RouterContext {...props} />}
```
官方还提出了一个要求：
> Ensure that you render a <RouterContext> at the end of the line, passing all the props passed to render   

这就好理解了，也就是说 ReduxAsyncConnect 想参与了rendering过程  
具体如何实现的呢？ 
简单看了一下代码，没有具体深究，简单理解一下吧。
通过asyncConnect装饰器，会向Component.reduxAsyncConnect存储信息。在reduxAsyncConnect(react 组件)组件中,我们就可以读取这部分信息了。等待所有组件的异步请求完成后，再渲染组件。基本是为了达到这个效果的。  
以后再深入研究   

## state.reduxAsyncConnect 结构
使用redux-async-connect会在state中出现reduxAsyncConnect属性，保存该组件使用到的数据。
为什么会出现reduxAsyncConnect属性呢？源于使用时下面这行代码,使用实例的第三步
```
const store = createStore(combineReducers({reduxAsyncConnect}));
```