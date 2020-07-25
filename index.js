const split = require('split2')
const pumpify = require('pumpify')

function pinoStackdriver (line) {
  try {
    // Parse the line into an object.
    line = JSON.parse(line)

    // Set the severity based on the level number.
    switch (line.level) {
      case 10: line.severity = 'DEBUG'; break
      case 20: line.severity = 'DEBUG'; break
      case 40: line.severity = 'WARNING'; break
      case 50: line.severity = 'ERROR'; break
      case 60: line.severity = 'CRITICAL'; break
      default: line.severity = 'INFO'
    }

    // converting msg to message
    if (line.msg) {
      line.message = line.msg;
    }

    // err.message or err.stack has priority over msg
    if (line.err) {
      if (line.err.message) {
        line.message = line.err.message;
      }
      if (line.err.stack) {
        line.message = line.err.stack;
      }
    }

    // Set time as a ISO string instead of Unix time.
    if (line.time) {
      line.time = new Date(line.time).toISOString();

      // adding time to message if exist
      if (line.message) {
        line.message = line.time + ' ' + line.message;
      }
    }

    if (line.name) {
      // adding log name to message if exist
      if (line.message) {
        line.message = '[' + line.name + ']' + ' ' + line.message;
      }
    }

    // Convert the object back to a JSON string.
    line = JSON.stringify(line) + '\n'
  } catch (err) {
    // Don't need to handle the error, just return the original line.
  }

  return line
}

const transform = split(pinoStackdriver)

function createStream (dest = process.stdout) {
  return pumpify(transform, dest)
}

module.exports = { transform, createStream }
