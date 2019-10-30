/* SIMATIC Unified Architecture V 1.2 | Copyright (C) Siemens AG 2015. All Rights Reserved. */
/**
 * Created by Administrator on 24/11/2014.
 */
(function () {
    'use strict';
    angular.module('siemens.simaticit.common')
        .constant('CONFIG', {
            'type': 'rt',
            'title': 'SIMATIC® IT',
            'description': 'A Test UI Application...',
            'logLevel': 'LOG_VERBOSE',
            'theme': 'Light',
            'home': 'home',
            'logo': 'common/images/SiemensLogo.png',

/* 'applicationServiceUrls': { "DemoApp": "http://localhost:80/sit-svc/Application/DemoApp/odata"}, */
/* 'applicationSignalManagerUrls': { "DemoApp": "http://localhost:80/sit-svc/Application/DemoApp/signals" }, */
/* Enable to comunicate with the back-end   'runtimeServicesUrl': 'http://localhost/sit-svc/runtime/odata/',      */
/* Enable to comunicate with the back-end   'engineeringServicesUrl': 'http://localhost/sit-svc/engineering/odata/',      */
/* Enable to comunicate with the back-end   'identityProviderUrl': 'http://localhost/IPSimatic-Logon',      */
/* Enable to comunicate with the back-end   'authorizationServiceUrl': 'http://localhost/sit-auth/OAuth/Authorize',   */
/* Enable to comunicate with the back-end   'documentationServicesUrl': 'http://localhost/documentation/odata/',   */
/* Enable to comunicate with the back-end   //'documentationCenterUrl': 'http://localhost:8080/',   */
/* Enable to comunicate with the back-end   'documentationCenterUrl': 'http://localhost/sit-ui/system/doc/default.html',   */

            'languages': ['en-US'],
            'clientID': '123',
            'menu': [[{
                "id": "open",
                "title": "open",
                "icon": "fa-eject",
                "action": {
                    "click": "toggle"
                }
            }], [{
                "id": "back",
                "title": "Back",
                "icon": "fa-chevron-circle-left",
                "action": {
                    "click": "navigateBack"
                },
                "bind": {
                    "display": "hasBackNavigation"
                }
            }, {
                "id": "home",
                "title": "Home page",
                "icon": "fa-home"
            }], [{
                'id': 'home.settings',
                'title': 'Settings Page',
                'icon': 'fa-gear'
            }
            ]]
        });
})();