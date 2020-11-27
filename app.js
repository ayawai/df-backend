const Koa = require("koa");
const json = require("koa-json");
const logger = require("koa-logger");
const KoaRouter = require("koa-router");
const parser = require("koa-bodyparser");
const cors = require("koa2-cors");

const app = new Koa();
const router = new KoaRouter();

const { getLists, handleSave, addData, handleSort, handleDel } = require('./controlers/index');

// Json Prettier middleware
app.use(json());
app.use(parser());
app.use(logger());
app.use(require('koa-static')(__dirname + '/view'));
app.use(cors());

router.get('/lists', getLists)

router.post('/add', addData)

router.post('/sort', handleSort)

router.post('/save', handleSave)

router.get('/delete', handleDel)

// Simple Middleware Example
// app.use(async (ctx) => (ctx.body = "hello world!"));
// app.use(async (ctx) => await ctx.render('index.html'));
// router.get('/', async (ctx, next) => {
// 	await ctx.render('index.html')
// })

app.use(router.routes());

app.listen(4000, () => console.log("---Server Started---"));

module.exports = app;