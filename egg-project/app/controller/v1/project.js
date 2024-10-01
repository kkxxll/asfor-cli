const Controller = require('egg').Controller;

class ProjectController extends Controller {
  // 项目模板查询
  async index() {
    const { ctx } = this;
    const res = await ctx.model.Project.find({});
    ctx.body = res;
  }

  // 项目模板查询
  async show() {
    const { ctx } = this;
    const id = ctx.params.id;
    const res = await ctx.model.Project.find({ value: id });
    if (res.length > 0) {
      ctx.body = res[0];
    } else {
      ctx.body = {};
    }
  }

  // 项目模板新增
  create() {
    this.ctx.body = 'create';
  }

  // 项目模板更新
  update() {
    this.ctx.body = 'update';
  }

  // 项目模板删除
  destroy() {
    this.ctx.body = 'destroy';
  }
}

module.exports = ProjectController;
