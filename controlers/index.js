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

// 获取用户
const getUser = ctx => {
  return new Promise(resolve => {
    let id = ctx.query.id;
    const sql = `SELECT * FROM df_user WHERE id=?`;
    connection.query(sql, id, (err, result) => {
      if (err) throw err;
      ctx.body = {
        code: 0,
        data: result[0]
      }
      resolve();
    })
  })
}

// 获取业务列表
const getBusiness = ctx => {
  return new Promise(resolve => {
    // let id = ctx.query.id;
    const sql = `SELECT * FROM df_business`;
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

// 获取业务对应表单
const getFormList = ctx => {
  return new Promise(resolve => {
    let {id, page, pageSize} = ctx.query;
    console.log(page, pageSize)
    let sql = '';
    let values;
    if (id) {
      sql = `SELECT * FROM df_form WHERE fid=? limit ?,?;`;
      values =  [id, +page, +pageSize]
    } else {
      sql = `SELECT * FROM df_form limit ?,?;`;
      values = [(page * pageSize) - pageSize, +pageSize]
    }
    connection.query(sql, values,  (err, result) => {
      if (err) throw err;
      ctx.body = {
        code: 0,
        data: result
      }
      resolve();
    })
  })
}

// 获取控件列表
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
/**
 * 新增表单
 * @param {*} ctx 
 */
const addForm = ctx => {
  console.log(ctx.request.body);
  return new Promise(resolve => {
    let {name, business, created_date, update_date} = ctx.request.body;
    // if (!created_date) {
    //   created_date = new Date();
    // }
    const sql = `INSERT INTO df_form(name, fid, created_date, update_date) VALUES ?`;
    const values = [
      [name, business, created_date, update_date]
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
/**
 * 删除表单
 * @param {*} ctx 
 */
const delForm = ctx => {
  return new Promise(resolve => {
    const {id} = ctx.request.body;
    const sql = `DELETE FROM df_form WHERE id = '${id}'`;
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

const coll = {getLists, handleDel, handleSort, addData, handleSave, getUser, getBusiness, getFormList, addForm, delForm}
module.exports = coll;

