# export NODE_ENV=staging || SET \"NODE_ENV=staging\"
# export NODE_ENV=testing || SET \"NODE_ENV=testing\"
# export NODE_ENV=production || SET \"NODE_ENV=production\"

# export NODE_STORAGE=fs || SET \"NODE_STORAGE=fs\"
# export NODE_STORAGE=mongo-native || SET \"NODE_STORAGE=mongo-native\"
# export NODE_STORAGE=mongo-mongoose || SET \"NODE_STORAGE=mongo-mongoose\"
# export NODE_STORAGE=mysql || SET \"NODE_STORAGE=mysql\"
 export NODE_STORAGE=mysql-xdevapi || SET \"NODE_STORAGE=mysql-xdevapi\"
# export NODE_STORAGE=postgres || SET \"NODE_STORAGE=postgres\"

# export PORT=3002 || SET \"PORT=3002\"

# export NODE_DEBUG=debug || SET \"NODE_DEBUG=debug\"           # use for debug logging in couple of files after amending their debuglog
 export NODE_DEBUG=mysqlx || SET \"NODE_DEBUG=mysqlx\"           # use for debug logging in single file

 node index.js          # app running
# node test/index.js   # app testing

# nodemon --exec index.js       # app running in amending mode
# nodemon --exec test/index.js  # app testing in amending mode

# node inspect index.js             # CLI debugging
# node --inspect-brk index.js       # app running in debugging mode
# node --inspect-brk test/index.js  # app testing in debugging mode

############################################################################
# execute on each amend before Heroku upload
# dos2unix ./start.sh