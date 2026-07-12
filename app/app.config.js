// Erweitert app.json dynamisch: Beim Web-Export fürs Hosting unter einem
// Unterpfad (GitHub Pages /Borck/gast-app, Prod später /gast-app) setzt der
// Deploy APP_WEB_BASE — native Builds bleiben komplett unberührt.
module.exports = ({ config }) => {
  if (process.env.APP_WEB_BASE) {
    config.experiments = { ...config.experiments, baseUrl: process.env.APP_WEB_BASE };
  }
  return config;
};
