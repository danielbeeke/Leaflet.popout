L.Popout = L.Popup.extend({

  onAdd: function (map) {
    this._map = map;
    var plugin = this;

    if (!this._container) {
      this._initLayout();
    }

    if (!this._map._panes.popoutPane) {
      // Add our map pane and position it outside the overflow hidden container.
      map._panes.popoutPane = map._createPane('leaflet-popout-pane');
      map._container.appendChild(map._panes.popoutPane)

      // Wrap the layers div, with a new overflow hidden.
      var element = map._panes.mapPane;
      var parent = element.parentNode;
      var wrapper = document.createElement('div');
      wrapper.setAttribute('class', 'leaflet-map-pane-wrapper');

      // set the wrapper as child (instead of the element)
      parent.replaceChild(wrapper, element);
      // set element as child of wrapper
      wrapper.appendChild(element);

      // Add a class so we can style on only the altered maps.
      map._container.className = map._container.className + ' leaflet-popout-altered';
    }

    // Add an event to sync the translate on of the map panes div to our div.
    map.on('move', this.onMapMove, this);
    this.onMapMove()

    var animFade = map.options.fadeAnimation;

    if (animFade) {
      L.DomUtil.setOpacity(this._container, 0);
    }
    map._panes.popoutPane.appendChild(this._container);

    map.on(this._getEvents(), this);

    this.update();

    if (animFade) {
      L.DomUtil.setOpacity(this._container, 1);
    }

    this.fire('open');

    map.fire('popoutopen', {popout: this});

    if (this._source) {
      this._source.fire('popoutopen', {popout: this});
    }
  },

  onMapMove: function () {
    var map = this._map;

    var translate = map._panes.mapPane.getAttribute('style');

    map._panes.popoutPane.setAttribute('style', translate);

    // Check if the popout center point is still inside the bounds of the current map.
    if (map.getBounds().contains(this._latlng)) {
      L.DomUtil.removeClass(this._container, 'leaflet-popout-outside-bounds')
    }
    else {
      L.DomUtil.addClass(this._container, 'leaflet-popout-outside-bounds')
    }
  },

  onRemove: function (map) {
    map._panes.popoutPane.removeChild(this._container);

    L.Util.falseFn(this._container.offsetWidth); // force reflow

    map.off(this._getEvents(), this);
    map.off('move', this.onMapMove, this);

    if (map.options.fadeAnimation) {
      L.DomUtil.setOpacity(this._container, 0);
    }

    this._map = null;

    this.fire('close');

    map.fire('popoutclose', {popout: this});

    if (this._source) {
      this._source.fire('popoutclose', {popout: this});
    }
  },

});

L.popout = function (options, source) {
  return new L.Popout(options, source);
};

/*
 * Popout extension to L.Marker, adding popout-related methods.
 */

L.Marker.include({
  openPopout: function () {
    if (this._popout && this._map && !this._map.hasLayer(this._popout)) {
      this._popout.setLatLng(this._latlng);
      this._map.openPopout(this._popout);
    }

    return this;
  },

  closePopout: function () {
    if (this._popout) {
      this._popout._close();
    }
    return this;
  },

  togglePopout: function () {
    if (this._popout) {
      if (this._popout._isOpen) {
        this.closePopout();
      } else {
        this.openPopout();
      }
    }
    return this;
  },

  bindPopout: function (content, options) {
    var anchor = L.point(this.options.icon.options.popoutAnchor || [0, 0]);

    anchor = anchor.add(L.Popout.prototype.options.offset);

    if (options && options.offset) {
      anchor = anchor.add(options.offset);
    }

    options = L.extend({offset: anchor}, options);

    if (!this._popoutHandlersAdded) {
      this
          .on('click', this.togglePopout, this)
          .on('remove', this.closePopout, this)
          .on('move', this._movePopout, this);
      this._popoutHandlersAdded = true;
    }

    if (content instanceof L.Popout) {
      L.setOptions(content, options);
      this._popout = content;
    } else {
      this._popout = new L.Popout(options, this)
        .setContent(content);
    }

    return this;
  },

  setPopoutContent: function (content) {
    if (this._popout) {
      this._popout.setContent(content);
    }
    return this;
  },

  unbindPopout: function () {
    if (this._popout) {
      this._popout = null;
      this
          .off('click', this.togglePopout, this)
          .off('remove', this.closePopout, this)
          .off('move', this._movePopout, this);
      this._popoutHandlersAdded = false;
    }
    return this;
  },

  getPopout: function () {
    return this._popout;
  },

  _movePopout: function (e) {
    this._popout.setLatLng(e.latlng);
  }
});

L.Map.include({
  openPopout: function (popout, latlng, options) { // (Popout) or (String || HTMLElement, LatLng[, Object])
    this.closePopout();

    if (!(popout instanceof L.Popout)) {
      var content = popout;

      popout = new L.Popout(options)
          .setLatLng(latlng)
          .setContent(content);
    }
    popout._isOpen = true;

    this._popout = popout;
    return this.addLayer(popout);
  },

  closePopout: function (popout) {
    if (!popout || popout === this._popout) {
      popout = this._popout;
      this._popout = null;
    }
    if (popout) {
      this.removeLayer(popout);
      popout._isOpen = false;
    }
    return this;
  }
});
