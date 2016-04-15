(function (root) {
  var depsList = [],
      nameFuncMap = {},
      module = {},
      loadCount = 0

  function _onScriptLoaded(script) {
    document.head.removeChild(script)
  }

  function _createScript(url) {
    var script = document.createElement('script')

    script.async = true
    script.src = url
    script['data-src'] = url

    script.onload = function() {
      _onScriptLoaded(script)
    }

    document.head.appendChild(script)
  }

  function _getCurrentScriptSrc() {
    return document.currentScript['data-src']
  }

  function _executeModule(loadOrderList) {
    loadOrderList.forEach(function(name) {
      var deps, ret

      deps = nameFuncMap[name].deps.map(function(dep_name) {
        return module[dep_name]
      })

      ret = nameFuncMap[name].func.apply(null, deps)

      if (/\.js$/.test(name)) {
        module[name] = ret
      }

    })

  }

  function _topoSortFunc() {
    var moduleList = Object.keys(nameFuncMap),
        l = [],
        s = [],
        i, node, tmp

    var handleNoIncome = function (i) {
      var flag = true,
          j

      for (j = 0; j < depsList.length; j++) {
        if (depsList[j][0] === i) {
          flag = false
        }
      }

      if (flag) {
        s.push(i)
      }
    }

    for (i = 0; i < moduleList.length; i++) {
      handleNoIncome(moduleList[i])
    }

    while (s.length > 0) {
      node = s.pop()
      l.push(node)

      for (i = 0; i < depsList.length; i++) {
        if (depsList[i][1] == node) {
          tmp = depsList[i][0]

          depsList.splice(i, 1)
          handleNoIncome(tmp)
          i--
        }
      }
    }

    if (l.length != moduleList.length) {
      throw('Circular dependencies')
    } else {
      return l
    }
  }

  function _complete(deps) {
    var loadOrderList

    if (loadCount !== 0) {
      loadCount -= 1
    }

    loadCount = loadCount + deps.length

    if (loadCount === 0) {
      loadOrderList = _topoSortFunc()
      _executeModule(loadOrderList)
    }
  }

  function _handleDep(name, dep) {
    depsList.push([name, dep])

    if (!nameFuncMap.hasOwnProperty(dep)) {
      _createScript(dep)
    }
  }

  function _handleModule(name, deps, func) {
    deps = deps.map(function(dep) {
      return /\.js$/.test(dep) ? dep : dep + '.js'
    })

    deps.forEach(function(dep) {
      _handleDep(name, dep)
    })

    nameFuncMap[name] = {
      deps: deps,
      func: func
    }

    _complete(deps)
  }

  function require(deps, func) {
    _handleModule('anonymous', deps, func)
  }

  function define(deps, func) {
    var name = _getCurrentScriptSrc()

    _handleModule(name, deps, func)
  }

  root.require = require
  root.define = define
})(this)

// 基本思路
// 1.动态创建脚本，获取模块对应的依赖和函数
// 2.根据依赖关系，利用拓扑排序确定模块加载队列
// 3.依次执行各个模块的函数，给它们传进对应的依赖作为参数，并为每个模块的返回值建立缓存

// API
// require(func)
// define(deps, func)