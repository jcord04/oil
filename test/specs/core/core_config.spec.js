import {
  getAdvancedSettingsPurposesDefault,
  getConfigValue,
  getCookieExpireInDays,
  getCustomPurposes,
  getDefaultToOptin,
  getHubPath,
  getIabVendorBlacklist,
  getIabVendorWhitelist,
  getLocale,
  getLocaleUrl,
  getLocaleVariantName,
  getLanguageFromLocale,
  getPoiGroupName,
  getPublicPath,
  setLocale,
  gdprApplies,
  setGdprApplies,
  getShowLimitedVendors
} from '../../../src/scripts/core/core_config';
import { loadFixture } from '../../test-utils/utils_fixtures';
import * as CoreLog from '../../../src/scripts/core/core_log';
import { resetOil } from '../../test-utils/utils_reset';
import { OilVersion } from '../../../src/scripts/core/core_utils';

describe('core_config', () => {

  const DEFAULT_FALLBACK_BACKEND_URL = 'https://oil-backend.herokuapp.com/oil/api/userViewLocales/enEN_01';
  const EXPECTED_PUBLIC_PATH = '//www/';
  const EXPECTED_PUBLIC_PATH_WITH_SLASH = '//www/i-forgot-the-trailing-slash/';

  beforeEach(() => resetOil());

  describe('getConfigValue', () => {

    it('returns default when value not found', function () {
      let result = getConfigValue('foo', 'bar');
      expect(result).toEqual('bar');
    });

  });

  describe('setLocale', function () {

    it('should store locale value', function () {
      setLocale('baz');
      const result = getLocale();

      expect(result).toEqual('baz');
    });

  });

  describe('parseServerUrls', function () {

    const DEFAULT_FALLBACK_BACKEND_URL_WITH_LOCALE_STRING = 'https://oil-backend.herokuapp.com/oil/api/userViewLocales/foo';

    it('Backwards compatibility: creates locale_url property if locale is string and locale_url empty', function () {
      loadFixture('config/given.config.with.locale.string.html');
      const result = getLocaleUrl();
      expect(result).toEqual(DEFAULT_FALLBACK_BACKEND_URL_WITH_LOCALE_STRING);
    });

    it('Backwards compatibility: creates locale_url property if locale and locale_url empty', function () {
      loadFixture('config/empty.config.html');
      const result = getLocaleUrl();
      expect(result).toEqual(DEFAULT_FALLBACK_BACKEND_URL);
    });

    it('should warn about deprecated locale string', function () {
      loadFixture('config/given.config.with.locale.string.html');

      spyOn(CoreLog, 'logError');
      getLocale();
      expect(CoreLog.logError).toHaveBeenCalled();
    });

  });

  describe('getLocaleVariantName', function() {

    it('returns default enEN_01 when locale in config empty', function () {
      let result = getLocaleVariantName();
      expect(result).toEqual('enEN_01');
    });

    it('returns string if config.locale is string', function () {
      loadFixture('config/given.config.with.locale.string.html');
      expect(getLocaleVariantName()).toEqual('foo');
    });

    it('returns localeId if config.locale is object', function () {
      AS_OIL = {
        CONFIG: {
          locale: {
            localeId: 'floo'
          }
        }
      };
      expect(getLocaleVariantName()).toEqual('floo');
    });

    it ('returns default enEN_01 when locale is defined without locale id', function () {
      AS_OIL = {
        CONFIG: {
          locale: {
          }
        }
      };
      expect(getLocaleVariantName()).toEqual('enEN_01');
    });
  });

  describe('getLanguageFromLocale', function() {

    it('retrieves substring from parameter', function() {
      expect(getLanguageFromLocale('foo_bar')).toEqual('fo');
    });

    it('returns "en" when parameter is null', function(){
      expect(getLanguageFromLocale()).toEqual('en');
    })

  });

  describe('setLocale', function () {

    it('should update locale property of config object', function () {
      setLocale('bra');
      expect(getConfigValue('locale', undefined)).toEqual('bra');
    });

  });

  describe('get config parameters', function () {

    const DEFAULT_COOKIE_EXPIRES_IN = 31;
    const DEFAULT_ADVANCED_SETTINGS_PURPOSES_DEFAULT = false;
    const DEFAULT_DEFAULT_TO_OPTIN = false;
    const DEFAULT_POI_GROUP = 'default';
    const DEFAULT_CUSTOM_PURPOSES = [];
    const DEFAULT_HUB_PATH = '/@ideasio/oil.js@1.2.3/release/current/hub.html';

    it('should call getConfigValue with their respective attribute', function () {
      loadFixture('config/full.config.html');

      expect(getHubPath()).toEqual(true);
      expect(getIabVendorWhitelist()).toEqual(true);
      expect(getIabVendorBlacklist()).toEqual(true);
      expect(getDefaultToOptin()).toEqual(true);
      expect(getAdvancedSettingsPurposesDefault()).toEqual(true);
      expect(getCustomPurposes()).toEqual(true);
      expect(getLocaleUrl()).toEqual(true);
      expect(getCookieExpireInDays()).toEqual(true);
      expect(getPoiGroupName()).toEqual(true);
    });

    it('should return correct default values', function () {
      spyOn(OilVersion, 'getLatestReleaseVersion').and.returnValue('1.2.3');
      expect(getHubPath()).toEqual(DEFAULT_HUB_PATH);
      expect(getIabVendorWhitelist()).toBeFalsy();
      expect(getIabVendorBlacklist()).toBeFalsy();
      expect(getDefaultToOptin()).toEqual(DEFAULT_DEFAULT_TO_OPTIN);
      expect(getAdvancedSettingsPurposesDefault()).toEqual(DEFAULT_ADVANCED_SETTINGS_PURPOSES_DEFAULT);
      expect(getCustomPurposes()).toEqual(DEFAULT_CUSTOM_PURPOSES);
      expect(getLocaleUrl()).toEqual(DEFAULT_FALLBACK_BACKEND_URL);
      expect(getCookieExpireInDays()).toEqual(DEFAULT_COOKIE_EXPIRES_IN);
      expect(getPoiGroupName()).toEqual(DEFAULT_POI_GROUP);
    });

  });

  describe('getPublicPath', function() {

    it('returns publicPath from configuration', function() {
      loadFixture('config/given.config.with.publicPath.html');
      expect(getPublicPath()).toEqual(EXPECTED_PUBLIC_PATH);
    });

    it('adds slash when missing to publicPath', function() {
      loadFixture('config/given.config.with.publicPath.noslash.html');
      expect(getPublicPath()).toEqual(EXPECTED_PUBLIC_PATH_WITH_SLASH);
    });

    it('returns undefined when no publicPath in config', function() {
      expect(getPublicPath()).toBeFalsy();
    });

  });

  describe('gdprApplies', function() {

    it('returns true when gdpr_applies_globally and gdpr_applies not in config', function() {
      expect(gdprApplies()).toBeTruthy();
    });

    it('returns false when gdpr_applies_globally is false and setGdprApplies is not invoked with true', function() {
      loadFixture('config/given.config.with.gdpr.not.applies.html');
      expect(gdprApplies()).toBeFalsy();
    });

    it('returns true when set after initialisation', function() {
      loadFixture('config/given.config.with.gdpr.not.applies.html');
      setGdprApplies(true);
      expect(gdprApplies()).toBeTruthy();
    });

  });

  describe('setGdprApplies', function() {

    it('sets gdprApplies in configuration', function() {
      loadFixture('config/given.config.with.gdpr.not.applies.html');
      expect(gdprApplies()).toBeFalsy();
      setGdprApplies(true);
      expect(gdprApplies()).toBeTruthy();
      setGdprApplies(false);
      expect(gdprApplies()).toBeFalsy();
    });

  });

  describe('getShowLimitedVendors', function() {
    
    it('returns false by default', function() {
      expect(getShowLimitedVendors()).toEqual(false);
    });

    it('returns true when show_limited_vendors_only in configuration', function() {
      loadFixture('config/given.config.with.advanced.settings.show.limited.vendors.html');
      expect(getShowLimitedVendors()).toBeTruthy();
    });

  });

});
