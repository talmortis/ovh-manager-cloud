class IpLoadBalancerZoneDeleteService {
  constructor(
    $q,
    $translate,
    CucCloudMessage,
    OvhApiIpLoadBalancing,
    CucRegionService,
    CucServiceHelper,
  ) {
    this.$q = $q;
    this.$translate = $translate;
    this.CucCloudMessage = CucCloudMessage;
    this.OvhApiIpLoadBalancing = OvhApiIpLoadBalancing;
    this.CucRegionService = CucRegionService;
    this.CucServiceHelper = CucServiceHelper;
  }

  getDeletableZones(serviceName) {
    return this.OvhApiIpLoadBalancing.v6().get({ serviceName })
      .$promise
      .then((response) => {
        const promises = _.map(response.zone, zone => this.OvhApiIpLoadBalancing.Zone().v6()
          .get({ serviceName, name: zone }).$promise);
        return this.$q.all(promises);
      })
      .then(zones => _.map(zones, zone => _.extend({
        name: zone.name,
        selectable: {
          value: zone.state !== 'released',
          reason: zone.state === 'released' ? this.$translate.instant('iplb_zone_delete_unavailable_already_released') : '',
        },
      }, this.CucRegionService.getRegion(zone.name))))
      .catch(this.CucServiceHelper.errorHandler('iplb_zone_delete_loading_error'));
  }

  deleteZones(serviceName, zones) {
    return this.getDeletableZones(serviceName)
      .then((deletableZones) => {
        if (zones.length === 0) {
          return this.CucServiceHelper.errorHandler('iplb_zone_delete_selection_error')({});
        }

        const deletableZoneCount = _.filter(
          deletableZones,
          item => item.selectable.value !== false,
        ).length - 1;
        const messages = {
          tooMany: deletableZoneCount > 1 ? 'iplb_zone_delete_selection_too_many_plural_error' : 'iplb_zone_delete_selection_too_many_single_error',
          success: zones.length > 1 ? 'iplb_zone_delete_plural_success' : 'iplb_zone_delete_single_success',
          error: zones.length > 1 ? 'iplb_zone_delete_plural_error' : 'iplb_zone_delete_single_error',
        };

        if (zones.length > deletableZoneCount) {
          return this.CucServiceHelper.errorHandler(messages.tooMany)({
            data: {
              zoneQuantity: deletableZoneCount,
            },
          });
        }

        const deletedZones = _.sortBy(_.map(zones, zone => zone.microRegion.text), zone => zone).join(', ');
        const promises = _.map(
          zones,
          zone => this.OvhApiIpLoadBalancing.Zone().v6()
            .delete({ serviceName, name: zone.name }, {}).$promise,
        );
        return this.$q.all(promises)
          .then(() => this.CucServiceHelper.successHandler(messages.success)(
            { zones: deletedZones },
          ))
          .catch(this.CucServiceHelper.errorHandler(messages.error));
      });
  }
}

angular.module('managerApp').service('IpLoadBalancerZoneDeleteService', IpLoadBalancerZoneDeleteService);
