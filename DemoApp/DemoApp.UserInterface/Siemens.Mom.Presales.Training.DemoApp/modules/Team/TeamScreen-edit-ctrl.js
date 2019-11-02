(function () {
    'use strict';
    angular.module('Siemens.Mom.Presales.Training.DemoApp.Team').config(EditScreenStateConfig);

    EditScreenController.$inject = ['Siemens.Mom.Presales.Training.DemoApp.Team.TeamScreen.service', '$state', '$stateParams', 'common.base', '$filter', '$scope','$translate'];
    function EditScreenController(dataService, $state, $stateParams, common, $filter, $scope, $translate) {
        var self = this;
        var sidePanelManager, backendService, propertyGridHandler;

        activate();
        function activate() {
            init();
            registerEvents();

            sidePanelManager.setTitle($translate.instant('Siemens.Mom.Presales.Training.DemoApp.Edit'));
            sidePanelManager.open('e');
        }

        function init() {
            sidePanelManager = common.services.sidePanel.service;
            backendService = common.services.runtime.backendService;

            //Initialize Model Data
            // TODO: Put here the properties of the entity managed by the service
            self.currentItem = angular.copy($stateParams.selectedItem);
            self.validInputs = false;

            //Expose Model Methods
            self.save = save;
            self.cancel = cancel;
            self.IsActive = getIsActiveValue();
            self.IsLeader = getIsLeaderValue();
        }

        function getIsActiveValue(){
            return [{
                label: $translate.instant('Siemens.Mom.Presales.Training.DemoApp.IsActive') ,
                checked: self.currentItem.IsActive
              }];
        }

        function getIsLeaderValue(){
            return [{
                label: $translate.instant('Siemens.Mom.Presales.Training.DemoApp.IsLeader') ,
                checked: self.currentItem.IsLeader
              }];
        }

        function registerEvents() {
            $scope.$on('sit-property-grid.validity-changed', onPropertyGridValidityChange);
        }

        function save() {
            self.currentItem.IsLeader = self.IsLeader[0].checked;
            self.currentItem.IsActive = self.IsActive[0].checked;
            dataService.update(self.currentItem).then(onSaveSuccess, backendService.backendError);
        }

        function cancel() {
            sidePanelManager.close();
            $state.go('^');
        }

        function onSaveSuccess(data) {
            sidePanelManager.close();
            $state.go('^', {}, { reload: true });
        }

        function onPropertyGridValidityChange(event, params) {
            self.validInputs = params.validity;
        }
    }

    EditScreenStateConfig.$inject = ['$stateProvider'];
    function EditScreenStateConfig($stateProvider) {
        var screenStateName = 'home.Siemens_Mom_Presales_Training_DemoApp_Team_TeamScreen';
        var moduleFolder = 'Siemens.Mom.Presales.Training.DemoApp/modules/Team';

        var state = {
            name: screenStateName + '.edit',
            url: '/edit/:id',
            views: {
                'property-area-container@': {
                    templateUrl: moduleFolder + '/TeamScreen-edit.html',
                    controller: EditScreenController,
                    controllerAs: 'vm'
                }
            },
            data: {
                title: 'Siemens.Mom.Presales.Training.DemoApp.Edit'
            },
            params: {
                selectedItem: null,
            }
        };
        $stateProvider.state(state);
    }
}());
