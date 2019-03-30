export NODE_ENV=staging || SET \"NODE_ENV=staging\"

export NODE_STORAGE=fs || SET \"NODE_STORAGE=fs\"

export NODE_DEBUG=debug || SET \"NODE_DEBUG=debug\"

node index.js  # app running
# node test.js   # app testing

# nodemon --exec index.js # app running in amending mode
# nodemon --exec test.js  # app testing in amending mode

# node --inspect-brk index.js # app running in debugging mode
# node --inspect-brk test.js  # app testing in debugging mode
