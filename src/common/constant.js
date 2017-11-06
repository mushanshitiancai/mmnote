const mime = require('mime');
mime.define({
    'application/x-minder': ['mmm']
})

module.exports = {
    mime: {
        minder: "application/x-minder"
    }
}