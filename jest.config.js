module.exports = {
  testEnvironment: "node",
  reporters: [
    "default",
    [
      "jest-html-reporters",
      {
        publicPath: "./reports",
        filename: "report.html",
        expand: true
      }
    ]
  ]
};
