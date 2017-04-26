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