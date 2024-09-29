const { Controller } = require('egg');


const ADD_TEMPLATE = [
  {
    name: 'vue3',
    npmName: '@asfor-cli/template-vue3',
    value: 'template-vue3',
    version: '0.0.1',
  },
  {
    name: 'react18',
    npmName: '@asfor-cli/template-react18',
    value: 'template-react18',
    version: '0.0.1',
  },
  {
    name: 'vue-admin',
    npmName: '@asfor-cli/template-react18',
    value: 'template-react18',
    version: '0.0.1',
  },
];

class ProjectController extends Controller {
  async template() {
    const { ctx } = this;
    ctx.body = ADD_TEMPLATE;
  }
}

module.exports = ProjectController;
