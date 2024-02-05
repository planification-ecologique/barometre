/*! DSFR v1.11.0 | SPDX-License-Identifier: MIT | License-Filename: LICENSE.md | restricted use (see terms and conditions) */

(function () {
  'use strict';

  var config = {
    prefix: 'fr',
    namespace: 'dsfr',
    organisation: '@gouvfr',
    version: '1.11.0'
  };

  var api = window[config.namespace];

  var DrawerSelector = {
    DRAWER: api.internals.ns.selector('drawer'),
    DRAWER_TOP: api.internals.ns.selector('drawer--top'),
    DRAWER_LEFT: api.internals.ns.selector('drawer--left'),
    DRAWER_RIGHT: api.internals.ns.selector('drawer--right'),
    DRAWER_BOTTOM: api.internals.ns.selector('drawer--bottom')
  };

  var Drawer = /*@__PURE__*/(function (superclass) {
    function Drawer () {
      superclass.apply(this, arguments);
    }

    if ( superclass ) Drawer.__proto__ = superclass;
    Drawer.prototype = Object.create( superclass && superclass.prototype );
    Drawer.prototype.constructor = Drawer;

    var staticAccessors = { instanceClassName: { configurable: true } };

    staticAccessors.instanceClassName.get = function () {
      return 'Drawer';
    };

    Drawer.prototype.init = function init () {
      this.isResizing = true;
      this._isDesktop = this.isBreakpoint(api.core.Breakpoints.LG);
      this.update();
    };

    Drawer.prototype.resize = function resize () {
      this._isDesktop = this.isBreakpoint(api.core.Breakpoints.LG);
      this.update();
    };

    Drawer.prototype.update = function update () {
      var collapse = this.element.getDescendantInstances('Collapse', null, true)[0];
      if (this._collapse && this._collapse !== collapse) { this._collapse.node.removeAttribute('method'); }
      this._collapse = collapse;

      var method = this._isDesktop && (this.hasClass(DrawerSelector.DRAWER_LEFT) || this.hasClass(DrawerSelector.DRAWER_RIGHT)) ? 'width' : 'height';

      if (this._collapse) { this._collapse.node.setAttribute(api.core.CollapseSelector.METHOD, method); }
    };

    Drawer.prototype.mutate = function mutate (attributeNames) {
      if (attributeNames.includes('class')) { this.update(); }
    };

    Object.defineProperties( Drawer, staticAccessors );

    return Drawer;
  }(api.core.Instance));

  api.drawer = {
    Drawer: Drawer,
    DrawerSelector: DrawerSelector
  };

  api.internals.register(api.drawer.DrawerSelector.DRAWER, api.drawer.Drawer);

})();
//# sourceMappingURL=drawer.nomodule.js.map
