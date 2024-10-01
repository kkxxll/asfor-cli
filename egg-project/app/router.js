/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  router.get('/', controller.home.index);
  router.get('/project/template', controller.project.template);
  router.resources('/v1/project', controller.v1.project);
};
