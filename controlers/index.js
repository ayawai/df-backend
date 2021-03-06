const mysql = require("mysql");

const connection = mysql.createConnection({
  host: "106.52.176.121",
  port: "3306",
  user: "root",
  password: "aptMes123",
  database: "tbpt",
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
// 待办填报列表
const myFormLists = ctx => {
  return new Promise(resolve => {
    let {userId, page, pageSize} = ctx.query;
    let sql = `SELECT * FROM ff_form_mains f LEFT JOIN ff_form_assignments r ON f.form_id=r.form_id WHERE f.form_status=2 and r.filled_by=? limit ?,?;`;

    let values =  [userId, page - 1, +pageSize];

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
// 获取跟踪列表
const trackFormLists = ctx => {
  return new Promise(resolve => {
    let {userId, page, pageSize} = ctx.query;
    let sql = `SELECT * FROM ff_form_mains f WHERE f.created_by=? limit ?,?;`;
    // const s_sql = `SELECT user_id, state, operation_date FROM ff_form LEFT JOIN ff_fill_user ON ff_fill_user.task_id=ff_form.id where publisher=1 ${formId ? "and id=?" : ""} limit ?,?`;
    const s_sql = `SELECT * FROM ff_form_mains fm LEFT JOIN ff_form_assignments fa ON fa.form_id=fm.form_id where fm.created_by=? limit ?,?`;

    let values =  [userId, page - 1, +pageSize];

    connection.query(sql, values,  (err, result) => {
      if (err) throw err;

      let p = result.map(item => {
        return new Promise(resolve =>{
          connection.query(s_sql, values, (err, res) => {
            const allData = {
              ...item,
              assignments: res
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
// 获取表单信息
const getFormInfo = ctx => {
  return new Promise(resolve => {
    let id = ctx.query.id;
    const sql = `SELECT * FROM ff_form_mains WHERE form_id=${id}`;
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
const getFormUnitInfo = ctx => {
  return new Promise(resolve => {
    let id = ctx.query.id;
    const sql = `SELECT * FROM ff_form_units WHERE form_id=${id}`;
    const ss_sql = `SELECT * FROM ff_form_fields s WHERE field_id=?`;
    connection.query(sql, (err, result) => {
      if (err) throw err;
      if (result.length) {
        let ps = result.map(item => {
          return new Promise(resolved => {
            connection.query(ss_sql, [item.unit_id], (err, r) => {
              if (err) throw err;
              item.fields = r;
              resolved(item)
            })
          })
        })
        Promise.all(ps).then(re => {
          ctx.body = {
            code: 0,
            data: re
          }
          resolve();
        })
      } else {
        ctx.body = {
          code: 0,
          data: []
        }
        resolve();
      }
    })
  })
}
// 获取表单单元信息
const getFormUnitInfo_bak = ctx => {
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

// 获取收集列表
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
  let {form_title, deadline, form_desc, form_status, units} = ctx.request.body;

  return new Promise(resolve => {
    const count_sql = `SELECT COUNT(8) count FROM ff_form_mains`;
    let formId;
    new Promise(s_resolve => {
      connection.query(count_sql, (err, result) => {
        if (err) throw err;
        formId = result[0].count + 1
        s_resolve()
      })
    }).then(() => {
      const sql = `INSERT INTO ff_form_mains(form_id, form_title, deadline, form_desc, form_status, publication_date, creation_date, created_by, last_updated_by, last_update_date) VALUES ?`;
      const values = [
        [formId, form_title, deadline, form_desc, form_status || '2', new Date(), new Date(), 1, 1, new Date()]
      ];
      connection.query(sql, [values], (err, result) => {
        if (err) throw err;
        console.log('formId1', formId);
        return formId
      })
    }).then(() => {
      const count_units_sql = `SELECT COUNT(8) count FROM ff_form_units`;
      let unitId;
      new Promise(s_resolve => {
        connection.query(count_units_sql, (err, result) => {
          if (err) throw err;
          unitId = result[0].count + 1
          s_resolve(unitId)
        })
        console.log('unitId', unitId);
      }).then(() => {
        if (units && units.length) {
          const ps = units.map(item => {
            return new Promise(unit_resolve => {
              const { unit_title, order_no, unit_desc, unit_type } = item;
  
              let sql = `INSERT INTO 
              ff_form_units(unit_id, form_id, unit_title, order_no, unit_desc, unit_type, bind_table, created_by, creation_date) 
              VALUES ?;`
  
              let values_unit = [
                [unitId, formId, unit_title, order_no, unit_desc, unit_type, '1', 1, new Date()]
              ];
              let param = [values_unit]
              if (item.controller && item.controller.length) {
                item.controller.forEach((j, k) => {
                  const {unit_line_id, label: title, placeholder: tip, controller: ui_type, lov: reference_values, isRequired: mandatory, defaultValue: default_value, attachment = "", bind_field_code = 1, need_statistics = 1, statisticType: statistical_formula, mark: comments} = j;
                  sql += `INSERT INTO ff_form_fields(form_id, unit_id, unit_line_id, title, tip, ui_type, reference_values, mandatory, default_value, attachment, bind_field_code, need_statistics, statistical_formula, comments, created_by, creation_date)
                  VALUES ?;`
                  let values_fields = [
                    [formId, unitId, k, title, tip, ui_type, reference_values, mandatory, default_value, attachment, bind_field_code, need_statistics, statistical_formula, comments, 1, new Date()]
                  ]
                  param.push(values_fields)
                })
              }
              
              connection.query(sql, param, (err, result) => {
                if (err) throw err;
                unit_resolve()
              })
            })
          })
          Promise.all(ps).then(res => {
            console.log('res', res);
            // const sql = `INSERT INTO 
            //   ff_form_units(form_id, title, unit_line_id, tip, ui_type, reference_values, mandatory, default_value, attachment, bind_field_code, need_statistics, statistical_formula, comments) 
            //   VALUES ?`
            ctx.body = {
              code: 0,
              message: `添加成功！`,
              data: true
            }
            resolve();
          })
  
          
        } else {
          ctx.body = {
            code: 1,
            message: `请添加单元信息！`,
            data: true
          }
          resolve();
        }
      })
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
        message: `删除成功！`,
        data: true
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
  trackFormLists,

}
module.exports = coll;

