const mysql = require("mysql");

const connection = mysql.createConnection({
  host: "106.52.176.121",
  port: "3306",
  user: "root",
  password: "aptMes123",
  database: "config_dynamic",
  multipleStatements: true
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
// 我的填报
const myFormLists = ctx => {
  return new Promise(resolve => {
    let {userId, page, pageSize} = ctx.query;
    let sql = `SELECT * FROM ff_fill_user r LEFT JOIN ff_form f ON f.id=r.task_id WHERE r.user_id=1 limit ?,?;`;

    let values =  [page - 1, +pageSize];

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
// 获取表单信息
const getFormInfo = ctx => {
  return new Promise(resolve => {
    let id = ctx.query.id;
    const sql = `SELECT * FROM df_form WHERE id=${id}`;
    connection.query(sql, (err, result) => {
      if (err) throw err;
      ctx.body = {
        code: 0,
        data: result[0]
      }
      resolve();
    })
  })
}
// 获取表单单元信息
const getFormUnitInfo = ctx => {
  return new Promise(resolve => {
    let id = ctx.query.id;
    const sql = `SELECT * FROM df_form_unit WHERE id=${id}`;
    const ss_sql = `SELECT * FROM df_form_field s WHERE p_id=${id}`;
    

    connection.query(sql, (err, result) => {
      if (err) throw err;
      let data = {};
      if (result[0]) {
        data = result[0];
        if (result[0]) {
          // const fieldsArr = result[0].fields.split(",");
          data.controller = [];
          connection.query(ss_sql, (err, r) => {
            if (err) throw err;
            data.controller = r;
            ctx.body = {
              code: 0,
              data
            }
            resolve()
          })
          // let p = fieldsArr.map(item => {
          //   return new Promise(function(resolve) {
          //     const s_sql = `SELECT * FROM df_form_field WHERE id=${item}`;
          //     connection.query(s_sql, (err, r) => {
          //       if (err) throw err;
          //       resolve(r[0])
          //     })
          //   })
          // })
          // Promise.all(p).then(value =>{
          //   data.controller = value.filter(i => !!i !== false);
          //   ctx.body = {
          //     code: 0,
          //     data
          //   }
          //   resolve()
          // })

          
        } else {
          
        }
      } else {
        
      }
    })
  })
}
// 获取表单数据
const getFormData = ctx => {
  return new Promise(resolve => {
    let id = ctx.query.id;
    const sql = `SELECT * FROM df_form_data WHERE form_id=${id}`;
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
    let sql = '';
    let values;
    if (id) {
      sql = `SELECT * FROM df_form WHERE fid=? limit ?,?;`;
      values =  [id, page - 1, +pageSize]
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
    let {page, pageSize, formId} = ctx.query;
    const sql = `SELECT * FROM dynamic_config WHERE form_id=? ORDER BY sort limit ?,?`;
    let values = [formId, (page * pageSize) - pageSize, +pageSize]
    connection.query(sql, values, (err, result) => {
      if (err) throw err;
      ctx.body = {
        code: 0,
        data: result
      }
      resolve();
    })
  })
}

// 获取跟踪列表
const getCollects = ctx => {
  return new Promise(resolve => {
    let {page, pageSize, formId} = ctx.query;
    // TODO: publisher暂时固定1
    
    // const sql =`SELECT * FROM ff_form where publisher=1 ${formId ? "and id=?" : ""} limit ?,?`;
    const sql =`SELECT f.deadline, f.desc, f.id, f.publisher, f.status task_status, d.id form_id, f.task_name, task_form, d.status form_status FROM ff_form f LEFT JOIN df_form d ON f.task_form=d.id where publisher=1 ${formId ? "and f.id=?" : ""} limit ?,?`;

    const s_sql = `SELECT user_id, state, operation_date FROM ff_form LEFT JOIN ff_fill_user ON ff_fill_user.task_id=ff_form.id where publisher=1 ${formId ? "and id=?" : ""} limit ?,?`;


    let values = [(page * pageSize) - pageSize, +pageSize];
    if (formId) {
      values = [formId, (page * pageSize) - pageSize, +pageSize];
    }
    connection.query(sql, values, (err, result) => {
      if (err) throw err;
      let p = result.map(item => {
        return new Promise(resolve =>{
          connection.query(s_sql, values, (err, res) => {
            const allData = {
              ...item,
              children: res
            }
            resolve(allData)
          })
        })
      })

      Promise.all(p).then(val => {
        ctx.body = {
          code: 0,
          data: val
        }
        resolve()
      })
      
    })
  })
}

const addData = ctx => {
  // console.log(ctx.request.body);
  return new Promise(resolve => {
    let {name, placeholder, defaultValue, select, options, sort, required, fid, field, formId} = ctx.request.body;
    const sql = `INSERT INTO dynamic_config(code, name, placeholder, default_value, options, sort, isRequired, fid, field, form_id)
    VALUES ?`;
    const values = [
      [select, name, placeholder, defaultValue, options, sort, required, fid, field, formId]
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
 * 保存字段
 * @param {*} ctx 
 * @returns 
 */
const saveField = ctx => {
  return new Promise(resolve => {
    console.log(ctx.request)
    let b = ctx.request.body;
    const sql = `INSERT INTO df_form_field(${Object.keys(b).join(",")}) VALUES (?)`;
    const values = Object.keys(b).map(j => b[j]);
    connection.query(sql, [values], (err, result) => {
      if (err) throw err;
      
      ctx.body = {
        code: 0,
        msg: "提交成功"
      }
      resolve()
    })
  })
}

/**
 * 新增表单
 * @param {*} ctx 
 */
const addForm = ctx => {
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
    const sql = `DELETE FROM df_form WHERE id = '${id}'; DELETE FROM dynamic_config WHERE form_id = ${id}`;
    // ; DELETE FROM dynamic_config WHERE form_id = ${id}
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
      let sql = `INSERT INTO df_form_data(form_id, field_name, row_id, value)
    VALUES (?, ?, ?, ?)`;
      const cr = connection.query(sql, [bd.formId, item, bd.uuid, bd[item]], (err, result) => {
        if (err) throw err;
        resolve();
      })
      conReturn.push(cr);
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

const delData = ctx => {
  return new Promise(resolve => {
    const {id} = ctx.request.body;
    const sql = `DELETE FROM df_form_data WHERE row_id=?`;

    connection.query(sql, [id], (err, result) => {
      if (err) throw err;
      ctx.body = {
        code: 0,
        msg: '删除成功!'
      };
      resolve()
    })
  })
}

const coll = {getLists, handleDel, handleSort, addData, handleSave, getUser, getBusiness, getFormList, addForm, delForm, getFormInfo, getFormData, delData,
  myFormLists,
  getFormUnitInfo,
  getCollects,
  saveField,

}
module.exports = coll;

