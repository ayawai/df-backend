const mysql = require("mysql");

const connection = mysql.createConnection({
  host: "www.cumquats.cn",
  port: "3306",
  user: "root",
  password: "aptMes123",
  database: "config_dynamic"
});

connection.connect(err => {
  if (err) throw err;
  console.log("database connected success!")
})

const getLists = ctx => {
  return new Promise(resolve => {
    let name = ctx.query.name;
    const sql = `SELECT * FROM dynamic_config ORDER BY sort`;
  
    connection.query(sql, (err, result) => {
      if (err) throw err;
      ctx.body = {
        code: 0,
        data: result
      }
      resolve();
    })
  })
}

const addData = ctx => {
  console.log(ctx.request.body);
  return new Promise(resolve => {
    let {name, placeholder, defaultValue, select, options, sort, required, fid, field} = ctx.request.body;
    const sql = `INSERT INTO dynamic_config(code, name, placeholder, default_value, options, sort, isRequired, fid, field)
    VALUES ?`;
    const values = [
      [select, name, placeholder, defaultValue, options, sort, required, fid, field]
    ];
    connection.query(sql, [values], (err, result) => {
      if (err) throw err;
      ctx.body = {
        code: 0,
        msg: `添加成功！` 
      }
      resolve();
    })
  })
}

const handleSort = ctx => {
  return new Promise(resolve => {
    let {originId, originSort, targetId, targetSort} = ctx.request.body;
    const sql = `UPDATE dynamic_config SET sort = case WHEN id = ? then ? WHEN id = ? then ? else sort end`;
    connection.query(sql, [originId, targetSort, targetId, originSort], (err, result) => {
      if (err) throw err;
      ctx.body = {
        code: 0,
        msg: `OK！` 
      }
      resolve();
    })
  })
}

const handleSave = ctx => {
  return new Promise(resolve => {
    let bd = ctx.request.body;
    let conReturn = [];
    Object.keys(bd).forEach(item => {
      if (bd.fid !== item) {
        const sql = "UPDATE dynamic_config SET default_value = ? where fid = ? and field = ?";
        const cr = connection.query(sql, [bd[item], bd.fid, item], (err, result) => {
          if (err) throw err;
          resolve();
        })
        conReturn.push(cr)
      }
    })
    Promise.all(conReturn)
    .then(() => {
      ctx.body = {
        code: 0,
        msg: `OK！` 
      }
      resolve();
    })
  })
}

const handleDel = ctx => {
  return new Promise(resolve => {
    const id = ctx.query.id;
    const sql = `DELETE FROM dynamic_config WHERE id = '${id}'`;
    connection.query(sql, (err, result) => {
      if (err) throw err;
      ctx.body = {
        code: 0,
        msg: `删除成功！`
      };
      resolve();
    })
  })
}

const coll = {getLists, handleDel, handleSort, addData, handleSave}
module.exports = coll;

