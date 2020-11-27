const router = require("koa-router");
const { graphqlKoa, graphiKoa } = require("graphql-server-koa");

router.get('/lists', getLists)
router.post('/add', addData)
router.post('/sort', handleSort)
router.post('/save', handleSave)
router.get('/delete', handleDel)
      // .get('/graphiql', async (ctx, next) => {
      //   await graphiKoa({endpointURL: '/graphql'})(ctx, next)
      // })

module.exports = router;