export function listToTrees(
  list: any[],
  options: {
    id: any
    root: any
    children: string
    parentId: string
  } = { id: 'menuId', root: 0, children: 'children', parentId: 'parentId' },
) {
  const map = new Map()
  const _list = [] as any[]
  const trees = [] as any[]
  for (let i = 0; i < list.length; i++) {
    const item = { ...list[i] }
    const id = item[options.id]
    const parentId = item[options.parentId]
    map.set(id, item)
    if (parentId === options.root) trees.push(item)
    else _list.push(item)
  }

  for (let i = 0; i < _list.length; i++) {
    const item = _list[i]
    const parentId = item[options.parentId]
    const parent = map.get(parentId)
    const children = (parent[options.children] || []) as any[]
    parent[options.children] = children
    children.push(item)
  }

  return trees
}
