# export NODE_ENV=staging || SET \"NODE_ENV=staging\"
# export NODE_ENV=testing || SET \"NODE_ENV=testing\"
# export NODE_ENV=production || SET \"NODE_ENV=production\"

# export NODE_STORAGE=fs || SET \"NODE_STORAGE=fs\"
# export NODE_STORAGE=mongo-native || SET \"NODE_STORAGE=mongo-native\"

# export PORT=3002 || SET \"PORT=3002\"

export NODE_CLI=true || SET \"NODE_CLI=true\"

# export NODE_DEBUG=debug || SET \"NODE_DEBUG=debug\"         # use for debug logging in couple of files after amending their debuglog
# export NODE_DEBUG=server || SET \"NODE_DEBUG=server\"           # use for debug logging in single file

node ./index.js          # app running
# node test/index.js   # app testing

# nodemon --exec index.js       # app running in amending mode
# nodemon --exec test/index.js  # app testing in amending mode

# node --inspect-brk index.js       # app running in debugging mode
# node --inspect-brk test/index.js  # app testing in debugging mode

############################################################################
# execute on each amend before Heroku upload
# dos2unix ./cli.sh