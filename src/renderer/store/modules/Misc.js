const state = {
  searchLock: false,
}

const mutations = {
  SET_SEARCHLOCK (state) {
    state.searchLock = true
  },
	UNSET_SEARCHLOCK (state) {
    state.searchLock = false
  },
}

export default {
  state,
  mutations
}
