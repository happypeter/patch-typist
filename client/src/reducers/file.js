const initialState = `import styled from 'styled-components'
 import Typist from '../typist/Typist'
 import io from 'socket.io-client'
 import Prism from 'prismjs'
 import 'prismjs/components/prism-javascript'
 import 'prismjs/components/prism-markup'
 import 'prismjs/components/prism-jsx'
 dsds
 sdsd
 sd
 sd
 sd
 sds
 ds
 d
 d
 d
 d
 d
 d
   componentDidMount = () => {
     const socket = io(SERVER_URL);
    socket.on('file content and patch', data => {
      const {files, commit} = this.state
       if (commit === data.commit) {
         const exist = files.find(file => file.name === data.file.name)
         if (!exist) {
`

const file = (state = initialState, action) => {
  switch (action.type) {
    case 'ADD_DELETE_HINT':
      const lineNum = action.mutation.lineNum
      const textLines = state.split('\n')
      return textLines.map((t, i) => {
          if (i === lineNum - 1) {
            return t = `${t} DELETE`
          }
          return t
        }).join('\n')
    default:
      return state
  }
}

export default file