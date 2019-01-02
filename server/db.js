const mongoose = require('mongoose');

const url = `mongodb://${process.env.db_user}:${process.env.db_pass}@ds147344.mlab.com:47344/pctimeline`;
mongoose.connect(url);

module.exports = mongoose.connection;
