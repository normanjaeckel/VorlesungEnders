System.config({
  baseURL: "/",
  defaultJSExtensions: true,
  transpiler: false,
  paths: {
    "github:*": "jspm_packages/github/*",
    "npm:*": "jspm_packages/npm/*"
  },

  map: {
    "angular": "github:angular/bower-angular@1.6.3",
    "angular-sanitize": "github:angular/bower-angular-sanitize@1.6.3",
    "lodash": "npm:lodash@4.17.4",
    "github:angular/bower-angular-sanitize@1.6.3": {
      "angular": "github:angular/bower-angular@1.6.3"
    }
  }
});
