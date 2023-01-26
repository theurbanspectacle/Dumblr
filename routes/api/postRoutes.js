const router = require("express").Router();
const Post = require("../../lib/Post");
const User = require("../../lib/User");
const Comment = require("../../lib/Comment");
const { withAuth } = require('../../utils/auth');

router.get('/', (req, res) => {
    Post.findAll({
        include: [
            User,
          ],
    }).then(posts => {
        posts = posts.reverse().map(post => post.toJSON());
        const promises = posts.map(post => {
            return Comment.findAll({
                where: {blog_post: post.id},
                include: [
                    User,
                  ],
            }).then(comments => {
                post.comments = comments.reverse();
            });
        });

        Promise.all(promises).then(() => {
            res.json(posts);
        }).catch(error => {
            console.error('Post comments get failed', error);
            res.status(400).json({error});
        });
    }).catch(error => {
        console.error('Post get failed', error);
        res.status(400).json({error});
    });
});

router.post('/', withAuth);

router.post('/', (req, res) => {
    Post.create({
        title: req.body.title,
        content: req.body.content,
        created_at: new Date().toISOString(),
        created_by: req.session.user.id,
    }).then(posts => {
        res.json(posts);
    }).catch(error => {
        console.error('Post create failed', error);
        res.status(400).json({error});
    });
});

router.post('/comment', withAuth);

router.post('/comment', (req, res) => {
    Comment.create({
        content: req.body.content,
        created_at: new Date().toISOString(),
        created_by: req.session.user.id,
        blog_post: req.body.blog_post,
    }).then(comment => {
        res.json(comment);
    }).catch(error => {
        console.error('Post create failed', error);
        res.status(400).json({error});
    });
});

router.get('/mine', withAuth);

router.get('/mine', (req, res) => {
    Post.findAll({
        include: [
            User,
          ],
          where: {
            created_by: req.session.user.id,
          },
    }).then(posts => {
        posts = posts.reverse().map(post => post.toJSON());
        const promises = posts.map(post => {
            return Comment.findAll({
                where: {blog_post: post.id},
                include: [
                    User,
                  ],
            }).then(comments => {
                post.comments = comments.reverse();
            });
        });

        Promise.all(promises).then(() => {
            res.json(posts);
        }).catch(error => {
            console.error('My Post comments get failed', error);
            res.status(400).json({error});
        });
    }).catch(error => {
        console.error('My Post get failed', error);
        res.status(400).json({error});
    });
});

router.delete('/:id', withAuth);

router.delete('/:id', (req, res) => {
    Post.destroy({
        where: {
            id: req.params.id,
        }
    }).then(() => {
        res.send('');
    }).catch(error => {
        console.error('Delete post failed', error);
        res.status(400).json({error});
    });
});

router.put('/:id', withAuth);

router.put('/:id', (req, res) => {
    Post.update(req.body, {
        where: {
            id: req.params.id,
        }
    }).then(() => {
        res.send('');
    }).catch(error => {
        console.error('Delete post failed', error);
        res.status(400).json({error});
    });
});

module.exports = router;
