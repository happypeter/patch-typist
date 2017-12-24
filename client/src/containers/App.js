import React, { Component } from 'react'
import styled from 'styled-components'
import Typist from '../typist/Typist'

import './highlight.css'
import io from 'socket.io-client'
import Prism from 'prismjs'

class App extends Component {
  state = {
    count: 0, // 鼠标点击次数
    file: {},
    files: []
  }

  componentDidMount = () => {
    const socket = io('http://localhost:3000');
    socket.on('file content and patch', data => {
      this.setState({
        files: this.state.files.concat(data.file)
      })
    });
  }

  componentDidUpdate = () => {
    Prism.highlightAll()
  }

  tick = () => {
    const {count} = this.state
    const {patch, content, name} = this.state.file

    //鼠标点击次数不能大于 patch 数组长度
    if (count >= patch.length) return

    const cursors = document.getElementsByClassName('Cursor Cursor--blinking')
    if(cursors.length) {
      for(let i = 0; i < cursors.length; i++) {
        cursors[i].remove()
      }
    }

    const action = patch[count]
    const index = content.findIndex(line => line.lineNum === action.lineNum && !line.type)
    if (action.type === 'added') {
      action.text = action.text ? (
        <Typist>
          <pre><code className='language-markup'>{action.text}</code></pre>
        </Typist>
      ) : <Typist><pre> </pre></Typist>

      this.setState({
        file: {name, patch, content: [...content.slice(0, index), action, ...content.slice(index)]},
        count: count + 1
      })
    } else if (action.type === 'deleted') {
      action.text = (
        <Typist>
          <span style={{color: 'blue'}}>{action.text}</span>
          <Typist.Backspace count={action.text.length} delay={200} />
        </Typist>
      )

      this.setState({
        file: {name, patch, content: [...content.slice(0, index), action, ...content.slice(index + 1)]},
        count: count + 1
      })
    }

  }

  handleClick = (index) => {
    this.setState({
      file: this.state.files[index],
      count: 0
    })
  }

  render() {
    const { files, file } = this.state

    //文件列表
    let fileList
    if (files.length) {
      fileList = files.map((file, index) => {
        return <FileTab key={index} onClick={this.handleClick.bind(this, index)}>{file.name}</FileTab>
      })
    }

    // 文件内容
    let content
    if (file && file.content) {
      content = file.content.map((line, index) => {
        return (
          <div key={index}>
            { line.text && !line.type ? (
              <pre key={index}>
                <code className='language-javascript'>{line.text}</code>
              </pre>
            ) : line.text}
          </div>
        )
      })
    }

    return (
      <Wrap>
        <Content>
          <FileTabs>{fileList}</FileTabs>
          <Editor onClick={this.tick}>{content}</Editor>
        </Content>
      </Wrap>
    )
  }
}

export default App

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  max-width: 1200px;
  margin: 0 auto;
`

const Content = styled.div`
  height: 100%;
  padding: 10px;
  display: flex;
  flex-direction: column;
`

const FileTabs = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 30px;
  border-bottom: 1px solid #00bcd4;
  flex-shrink: 0;
`

const FileTab = styled.div`
  margin: 24px;
  padding: 10px;
  &:hover {
    background: #00bcd4;
    cursor: pointer;
  }
  &:first-child {
    margin-left: 0
  }
`

const Editor = styled.div`
  background: #1d1f27;
  font-family: monospace;
  font-size: 14px;
  overflow: auto;
  padding: 16px;
  line-height: 1.8;
  flex-grow: 1;
`
