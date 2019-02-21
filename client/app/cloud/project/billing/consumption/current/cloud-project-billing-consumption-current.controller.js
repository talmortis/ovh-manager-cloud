angular.module('managerApp').controller('CloudProjectBillingConsumptionCurrentCtrl',
  function CloudProjectBillingConsumptionCurrentCtrl($q, $translate, $stateParams, CloudMessage,
    CloudProjectBillingLegacyService, OvhApiCloudProjectUsageCurrent) {
    const self = this;
    self.data = {};

    function init() {
      self.loading = true;

      return OvhApiCloudProjectUsageCurrent.v6()
        .get({ serviceName: $stateParams.projectId }).$promise
        .then(billingInfo => CloudProjectBillingLegacyService.getConsumptionDetails(
          billingInfo,
          billingInfo,
        ))
        .then((data) => {
          self.data = data;
        })
        .catch((err) => {
          CloudMessage.error([$translate.instant('cpb_error_message'), (err.data && err.data.message) || ''].join(' '));
          return $q.reject(err);
        })
        .finally(() => {
          self.loading = false;
        });
    }

    init();
  });
