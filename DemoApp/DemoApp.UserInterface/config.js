﻿(function () {
  'use strict';
  angular.module('siemens.simaticit.common')
    .constant('CONFIG', {
  "type": "rt",
  "title": "Test UI Application",
  "logLevel": "Verbose",
  "theme": "Light",
  "logo": "common/images/SiemensLogo.png",
  "languages": [
    "en-US"
  ],
  "home": "home.Siemens_Mom_Presales_Training_DemoApp_Person_PersonScreen",
  "masterApp": "Siemens.Mom.Presales.Training.DemoApp",
  "dependencies": [
    "Siemens.Mom.Presales.Training.DemoApp"
  ],
  "menu": [
    {
      "id": "home.Siemens_Mom_Presales_Training_DemoApp_Person_PersonScreen",
      "title": "PersonScreen",
      "icon": "fa-folder",
      "display": true,
      "securable": false
    },
    {
      "id": "home.Siemens_Mom_Presales_Training_DemoApp_Team_TeamScreen",
      "title": "TeamScreen",
      "icon": "fa-folder",
      "display": true,
      "securable": false
    }
  ],
  "clientID": "123",
  "runtimeServicesUrl": "http://localhost/sit-svc/runtime/odata/",
  "identityProviderUrl": "http://localhost/IPSimatic-Logon",
  "authorizationServiceUrl": "http://localhost/sit-auth/OAuth/Authorize",
  "engineeringServicesUrl": "http://localhost/sit-svc/engineering/odata/",
  "applicationServiceUrls": {
    "DemoApp": "http://localhost:9000/runtime/DemoApp/odata"
  },
  "applicationArchivingServiceUrls": {},
  "applicationSignalManagerUrls": {}
});
})();