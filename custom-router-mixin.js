import PropertyMixin from '../backed/src/mixins/property-mixin.js';
import {merge} from '../backed/src/utils.js';

export default base => {
  return class CustomRouterMixin extends PropertyMixin(base) {
    static get properties() {
      return merge(super.properties, {
        route: {
          // reflect: true,
          observer: '__routeObserver'
        },

        /**
         * whenever visited site isn't a valid one router will return selected fallback url
         */
        fallback: {
          observer: '__routeObserver'
        },

        /**
         * Array of routes
         */
        routes: {
          value: [],
          observer: '__routeObserver'
        },

        /**
         * @param {string|regexp} pattern
         */
        pattern: {
          value: null
        }
      });
    }

    /**
     * place ! after hash or not
     */
    get hashbang() {
      return !Boolean(this.hasAttribute('no-hashbang'));
    }

    constructor() {
      super();
    }
    connectedCallback() {
      super.connectedCallback();
      this._onHashChange = this._onHashChange.bind(this);
      window.addEventListener('hashchange', this._onHashChange);
      this._onHashChange({newURL: location.href});
    }

    parseURL(url) {
      const pattern = this.pattern ? this.pattern : this.hashbang ? '#!/' : '#/';
      url = url.split(pattern);
      // whenever url[1] is empty or url is undefined, return null
      if (url && !url[1] || url && url[1].length === 0 || !url || url && !url[1]) return null;
      else return url[1];
    }

    _onHashChange(event) {
      const route = this.parseURL(event.newURL);
      if (this.route !== route) {
        this.route = route;
      }
    }

    __routeObserver() {
      // check if route exists
      // TODO: parseURL & get subroute .
      if (this.route && this.routes && this.routes.length > 0) {
        if (this.routes && this.routes.indexOf(this.route) === -1) {
          this.route = this.fallback || '404';
        }
        location.hash = this.hashbang ? `!/${this.route}` : `/${this.route}`;
        this.routeChange(this.route);
      }
    }

    routeChange(route) {
      this.dispatchEvent(new CustomEvent('route-change', {value: route}));
    }

    go(route) {
      this.route = route;
    }
  };
}
