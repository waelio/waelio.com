const LSidebar = {
  namespaced: true,
  state: {
    sidebar_public: [
      {
        to: { name: 'contact' },
        avatar: 'contact_page',
        label: 'Contact Us',
        caption: 'Contact us for Questions, Suggestions or anything else.'
      },
      {
        to: { name: 'instagramfeed' },
        avatar: 'dynamic_feed',
        label: 'Instagram Feed',
        caption: 'My Instagram Feed'
      },
      {
        to: { name: 'terms' },
        avatar: 'description',
        label: 'Our Terms',
        caption: 'TERMS & CONDITIONS'
      },
      {
        to: { name: 'privacy' },
        avatar: 'policy',
        label: 'Privacy',
        caption: 'Our Privacy'
      },
      {
        to: { name: 'credits' },
        avatar: 'emoji_objects',
        label: 'Credits',
        caption: 'Amazing help'
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
