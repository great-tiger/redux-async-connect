import { connect } from 'react-redux';
//定义action type 因为必须保证它是全局唯一的，所以这种命名方式最好。
export const LOAD = 'reduxAsyncConnect/LOAD';
export const LOAD_SUCCESS = 'reduxAsyncConnect/LOAD_SUCCESS';
export const LOAD_FAIL = 'reduxAsyncConnect/LOAD_FAIL';
export const CLEAR = 'reduxAsyncConnect/CLEAR';
export const BEGIN_GLOBAL_LOAD = 'reduxAsyncConnect/BEGIN_GLOBAL_LOAD';
export const END_GLOBAL_LOAD = 'reduxAsyncConnect/END_GLOBAL_LOAD';

export function reducer(state = {loaded: false}, action = {}) {
  switch (action.type) {
    case BEGIN_GLOBAL_LOAD:
      return {
        ...state,
        loaded: false
      };
    case END_GLOBAL_LOAD:
      return {
        ...state,
        loaded: true
      };
    case LOAD:
      return {
        ...state,
        loadState: {
          [action.key]: {
            loading: true,
            loaded: false
          }
        }
      };
    case LOAD_SUCCESS:
      return {
        ...state,
        loadState: {
          [action.key]: {
            loading: false,
            loaded: true,
            error: null
          }
        },
        [action.key]: action.data
      };
    case LOAD_FAIL:
      return {
        ...state,
        loadState: {
          [action.key]: {
            loading: false,
            loaded: false,
            error: action.error
          }
        },
        [action.key]: null
      };
    case CLEAR:
      return {
        ...state,
        loadState: {
          [action.key]: {
            loading: false,
            loaded: false,
            error: null
          }
        },
        [action.key]: null
      };
    default:
      return state;
  }
}

export function clearKey(key) {
  return {
    type: CLEAR,
    key
  };
}

export function beginGlobalLoad() {
  return { type: BEGIN_GLOBAL_LOAD };
}

export function endGlobalLoad() {
  return { type: END_GLOBAL_LOAD };
}

function load(key) {
  return {
    type: LOAD,
    key
  };
}

export function loadSuccess(key, data) {
  return {
    type: LOAD_SUCCESS,
    key,
    data
  };
}

function loadFail(key, error) {
  return {
    type: LOAD_FAIL,
    key,
    error
  };
}
/*
asyncItems
[{
  deferred: true,
  promise: ({store: {dispatch, getState}}) => {
    if (!isLoaded(getState())) {
      return dispatch(loadWidgets());
    }
  }
}]

下面的方法对上面的asyncItems进行再封装
分两种情况：
item中不包含key：则对item不进行处理
item中包含key：则会对item中的promise方法进行dispath封装

最后返回map后的asyncItems
*/
function wrapWithDispatch(asyncItems) {
  return asyncItems.map(item =>
    item.key ? {...item, promise: (options) => {
      const {dispatch} = options.store;
      const promiseOrResult = item.promise(options);
      if (promiseOrResult !== undefined) {
        if (promiseOrResult.then instanceof Function) {
          dispatch(load(item.key));
          promiseOrResult.then(data => dispatch(loadSuccess(item.key, data)))
                         .catch(err => dispatch(loadFail(item.key, err)));
        } else {
          dispatch(loadSuccess(item.key, promiseOrResult));
        }

      }
      return promiseOrResult;
    }} : item
  );
}
/*
使用
@asyncConnect([{
  deferred: true,
  promise: ({store: {dispatch, getState}}) => {
    if (!isLoaded(getState())) {
      return dispatch(loadWidgets());
    }
  }
}])

如果asyncItems中每一项中都不包含key的话，下面的处理逻辑就是
Component.reduxAsyncConnect=asyncItems
connect({})(Component);
剩下的就是好好研究一下Component.reduxAsyncConnect,什么时候用到了，起到了什么作用？
*/
export function asyncConnect(asyncItems) {
  return Component => {
    //在组件上保存map后的asyncItems
    Component.reduxAsyncConnect = wrapWithDispatch(asyncItems);

    //有关reduce的解释https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/Reduce?v=control
    const finalMapStateToProps = state => {
      return asyncItems.reduce((result, item) =>
        item.key ? {...result, [item.key]: state.reduxAsyncConnect[item.key]} : result,
        {}//result的初始值
      );
    };
    //如果asyncItems中都不包含key的话，finalMapStateToProps={}
    //finalMapStateToProps 将state映射到Component属性props
    return connect(finalMapStateToProps)(Component);
  };
}