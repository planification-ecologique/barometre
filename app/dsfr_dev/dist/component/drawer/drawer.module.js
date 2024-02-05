/*! DSFR v1.11.0 | SPDX-License-Identifier: MIT | License-Filename: LICENSE.md | restricted use (see terms and conditions) */

const config = {
  prefix: 'fr',
  namespace: 'dsfr',
  organisation: '@gouvfr',
  version: '1.11.0'
};

const api = window[config.namespace];

const DrawerSelector = {
  DRAWER: api.internals.ns.selector('drawer'),
  DRAWER_TOP: api.internals.ns.selector('drawer--top'),
  DRAWER_LEFT: api.internals.ns.selector('drawer--left'),
  DRAWER_RIGHT: api.internals.ns.selector('drawer--right'),
  DRAWER_BOTTOM: api.internals.ns.selector('drawer--bottom')
};

class Drawer extends api.core.Instance {
  static get instanceClassName () {
    return 'Drawer';
  }

  init () {
    this.isResizing = true;
    this._isDesktop = this.isBreakpoint(api.core.Breakpoints.LG);
    this.update();
  }

  resize () {
    this._isDesktop = this.isBreakpoint(api.core.Breakpoints.LG);
    this.update();
  }

  update () {
    const collapse = this.element.getDescendantInstances('Collapse', null, true)[0];
    if (this._collapse && this._collapse !== collapse) this._collapse.node.removeAttribute('method');
    this._collapse = collapse;

    const method = this._isDesktop && (this.hasClass(DrawerSelector.DRAWER_LEFT) || this.hasClass(DrawerSelector.DRAWER_RIGHT)) ? 'width' : 'height';

    if (this._collapse) this._collapse.node.setAttribute(api.core.CollapseSelector.METHOD, method);
  }

  mutate (attributeNames) {
    if (attributeNames.includes('class')) this.update();
  }
}

api.drawer = {
  Drawer: Drawer,
  DrawerSelector: DrawerSelector
};

api.internals.register(api.drawer.DrawerSelector.DRAWER, api.drawer.Drawer);
