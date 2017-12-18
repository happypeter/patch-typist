const express = require('express')
const app = express()
const logger = require('morgan')

const socketIo = require('socket.io')
const http = require('http')

const git = require('./utils/git-cmd')
const diffParser = require('./utils/parser')

const server = http.createServer(app)
const io = socketIo(server)

io.on('connection', socket => {
  socket.on('repo', source => {
    const repo = source.repo
    git.log(repo)
      .then(data => {
        if (!data) {
          console.log("No Commits")
          return
        }
        socket.broadcast.emit('git commits', {commits: data.split('\n')});
      })
      .catch(error => {
        if (error.code === 129) {
          process.stderr.write("Error: Not a git repository\n")
          return
        }
        process.stderr.write(error.message)
        return
      })
  })

  socket.on('commit', source => {
    Promise.all([
      git.lsTree(source),
      git.diffTree(source)
    ])
      .then(result => {
        socket.broadcast.emit('commit files', {
          files: result[0].split('\n'),
          changed: result[1].split('\n')
        })
      })
      .catch(error => {
        console.log(error)
      })
  })

  socket.on('file', source => {
    Promise.all([
      git.showFileContent(source),
      git.showFilePatch(source)
    ])
      .then(result => {
        const file = result[0].split('\n')
          .map((line, index) => {
            return {
              text: line,
              lineNum: index + 1
            }
          })
        socket.broadcast.emit('file content and patch', {
          fileName: source.file,
          file,
          // patch: diffParser(result[1])
        });
      })
  })
})

app.use(logger('dev'))

app.use(function(err, req, res, next) {
  console.log(err.stack)
  res.status(err.status || 500);
  res.json({success: false, error: err.message })
})

server.listen(3000, () => {
  console.log(`running on port 3000...`)
})