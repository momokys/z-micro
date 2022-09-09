# z-micro

#### 介绍
基于 iframe 和 web component 的微前端框架。
支持 vite 项目。
支持多实例，可同时存在多个子应用。

#### 安装教程
```bash
# npm
npm install @z-micro/core

# yarn
yarn add @z-micro/core

# pnpm
pnpm add @z-micro/core

```

#### 使用说明
1、主应用导入 @z-micro/core
```js
import '@z-micro/core'
```
2、使用 micro-app 和 micro-container

```html

<micro-container active="vue3">
  <micro-app name="vue3" host="http://localhost:7500" uri="vue3" />
  <micro-app name="react" host="http://localhost:7600" uri="react" />
</micro-container>

```

#### 配置说明

##### micro-container 属性

| 属性     | 说明       |
|--------|----------|
| active | 当前激活的子应用 |



##### micro-app 属性

| 属性 | 说明                                              |
| ---- | ------------------------------------------------- |
| name | 子应用名称，同一个 container 下不能重复，不能为空 |
| host | 子应用 html 入口地址，不能为空                    |
| uri  | 前缀                                              |
