const Koa = require("koa");
const json = require("koa-json");
const logger = require("koa-logger");
const KoaRouter = require("koa-router");
const parser = require("koa-bodyparser");
const cors = require("koa2-cors");

const app = new Koa();
const router = new KoaRouter();

const {
  getLists,
  handleSave,
  addData,
  handleSort,
  handleDel,
  getUser,
  getBusiness,
  getFormList,
  addForm,
  delForm,
  getFormInfo,
  getFormData,
  delData,
  myFormLists,
  getFormUnitInfo,
  getCollects,
  saveField
} = require('./controlers/index');

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

router.get('/user', getUser)

router.get('/business', getBusiness)

router.get('/getFormList', getFormList);

router.post('/addForm', addForm);

router.post('/delForm', delForm);

router.get('/getFormInfo', getFormInfo);

router.get('/getFormData', getFormData);

router.post('/delData', delData);
// 我的填报
router.get('/myForm', myFormLists);
// 表单单元
router.get('/getUnit', getFormUnitInfo);
// 收集的表单
router.get('/getCollects', getCollects);
// 保存字段
router.post('/saveField', saveField)

// Simple Middleware Example
// app.use(async (ctx) => (ctx.body = "hello world!"));
// app.use(async (ctx) => await ctx.render('index.html'));
// router.get('/', async (ctx, next) => {
// 	await ctx.render('index.html')
// })

app.use(router.routes());

app.listen(4000, () => console.log("---Server Started---"));

module.exports = app;