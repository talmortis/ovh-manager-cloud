class LogsHomeAccountModalCtrl {
    constructor ($scope, $state, ControllerHelper) {
        this.$scope = $scope;
        this.$state = $state;
        this.ControllerHelper = ControllerHelper;
        this.openModal();
    }

    openModal () {
        this.ControllerHelper.modal.showModal({
            modalConfig: {
                templateUrl: "app/dbaas/logs/detail/home/account/logs-home-account.html",
                controller: "LogsHomeAccountCtrl",
                controllerAs: "ctrl"
            }
        }).then(() => this.$scope.$parent.ctrl.initLoaders())
            .finally(() => this.onCloseModal());
    }

    onCloseModal () {
        this.$state.go("dbaas.logs.detail.home");
    }
}

angular.module("managerApp").controller("LogsHomeAccountModalCtrl", LogsHomeAccountModalCtrl);
