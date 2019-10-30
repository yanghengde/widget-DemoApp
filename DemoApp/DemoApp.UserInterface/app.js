/* SIMATIC Unified Architecture V 1.2 | Copyright (C) Siemens AG 2015. All Rights Reserved. */
(function() {
    'use strict';

    /**
     * @ngdoc module
     * @name siemens.simaticit.app

     */
    var app = angular.module('siemens.simaticit.app', [
        // Angular modules
        'ngAnimate',        // animations
        'ui.router',
        'ngSanitize',       // sanitizes html bindings (ex: sidebar.js)
        'ngResource',

        /*jshint laxcomma:true */

        // 3rd Party Modules
        'ui.bootstrap'  // ui-bootstrap (ex: carousel, pagination, dialog),

        //local modules
        , 'siemens.simaticit.common'

        //TODO: It is necessary to add the reference to the root AngularJS Module as a dependency
        //for the siemens.simaticit.app module 





    ]);

    app.run(['$rootScope', '$state', '$stateParams', 'RESOURCE', 'THEMES', 'common',
        function ($rootScope, $state, $stateParams, RESOURCE, THEMES, common) {
        $rootScope.$state = $state;
        $rootScope.$stateParams = $stateParams;
        common.shell.setEnvironment(RESOURCE, THEMES);

        $rootScope.globalOverlayData = {
            text: '',
            title: '',
            buttons: {}
        };

        $rootScope.globalBusyIndicator ={
            id: 'globalBusyIndicatorId',
            message:'Working...',
            icon:'fa fa-spinner fa-2x fa-spin'
        };

        common.authentication.init();


    }]);
})();


