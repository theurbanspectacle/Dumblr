const router = require('express').Router();
const userRoutes = require('./userRoutes');
const postRoutes = require('./postRoutes');

router.use((req, res, next) => {
    res.setHeader('X-Current-User', req.session.user?.id || '');
    next();
});

router.use('/user', userRoutes);
router.use('/post', postRoutes);

//Make sure this is last in the code here.
router.use((req, res) => {
    res.status(404).send("404: Route not found.")
});

module.exports = router;