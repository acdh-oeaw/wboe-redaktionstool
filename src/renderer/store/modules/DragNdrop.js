const state = {
  dragUid: null,
	dragParserUid: null,
}

const mutations = {
  SET_DRAG_UID (state, aUId) {
    state.dragUid = aUId
  },
	SET_DRAG_PARSER_UID (state, aUId) {
    state.dragParserUid = aUId
  }
}

export default {
  state,
  mutations
}
