# simpleRequirejs
  A simple module loader

# 基本思路
  1. 动态创建脚本，获取模块对应的依赖和函数
  2. 根据依赖关系，利用拓扑排序确定模块加载队列
  3. 依次执行各个模块的函数，给它们传进对应的依赖作为参数，并为每个模块的返回值建立缓存

# API
  * require(func)
  * define(deps, func)
