const LSidebar = {
  namespaced: true,
  state: {
    sidebar_public: [
      {
        to: { name: 'todo' },
        avatar: 'note',
        label: 'Todo App',
        caption: 'create a todo list..'
      },
      {
        to: { name: 'contact' },
        avatar: 'shield',
        label: 'Contact Us',
        caption: 'Contact us for Questions, Suggestions or anything else.'
      },
      {
        to: { name: 'terms' },
        avatar: 'shield',
        label: 'Our Terms',
        caption: 'TERMS & CONDITIONS'
      },
      {
        to: { name: 'privacy' },
        avatar: 'shield',
        label: 'Privacy',
        caption: 'Our Privacy'
      }
    ],
    sidebar_authenticated: [
      {
        avatar: 'note',
        label: 'Todo App',
        caption: 'create a todo list..'
      }
    ]
  },
  mutations: {},
  actions: {},
  getters: {
    sidebar_public (state) {
      return state.sidebar_public
    },
    sidebar_authenticated (state) {
      return state.sidebar_authenticated
    }
  }
}

export default LSidebar
