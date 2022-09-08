import { defineStore } from 'pinia'

export const useSetting = defineStore({
  id: 'setting',
  state: () => {
    const opened = localStorage.getItem('sidebar.opened')
    return {
      title: '微前端应用',
      sidebar: {
        minWidth: '64px',
        maxWidth: '210px',
        opened: opened === undefined || opened === 'true',
      },
    }
  },
  actions: {
    toggleSidebar() {
      this.sidebar.opened = !this.sidebar.opened
      localStorage.setItem('sidebar.opened', this.sidebar.opened + '')
    },
  },
})
