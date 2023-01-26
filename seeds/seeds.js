const sequelize = require('../config/connection');
const Post = require('../lib/Post');
const User = require('../lib/User');
const Comment = require('../lib/Comment');

sequelize.sync({force: true}).then(() => {
  console.log('Seed set');
}).catch(error => {
  console.error('Unable to set up Sequelize', error);
});

