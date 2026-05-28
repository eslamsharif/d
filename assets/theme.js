(function () {
  function initMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var drawer = document.querySelector('[data-mobile-menu]');
    var close = document.querySelector('[data-menu-close]');
    if (!toggle || !drawer) return;

    function open() {
      drawer.hidden = false;
      toggle.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    }

    function shut() {
      drawer.hidden = true;
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }

    toggle.addEventListener('click', open);
    if (close) close.addEventListener('click', shut);
    drawer.addEventListener('click', function (event) {
      if (event.target === drawer) shut();
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && !drawer.hidden) shut();
    });
  }

  function initSearch() {
    document.querySelectorAll('[data-search-toggle]').forEach(function (button) {
      button.addEventListener('click', function () {
        var target = document.querySelector('[data-search-strip]');
        if (!target) return;
        target.hidden = !target.hidden;
        if (!target.hidden) {
          var input = target.querySelector('input');
          if (input) input.focus();
        }
      });
    });
  }

  function updateCartCount(count) {
    var link = document.querySelector('[data-cart-link]');
    if (!link) return;
    var badge = link.querySelector('[data-cart-count]');
    if (!badge && count > 0) {
      badge = document.createElement('span');
      badge.className = 'm-cart-dot';
      badge.setAttribute('data-cart-count', '');
      link.appendChild(badge);
    }
    if (badge) {
      badge.textContent = count;
      badge.hidden = count <= 0;
    }
  }

  function initQuickAdd() {
    document.querySelectorAll('.m-card-quick').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        if (!window.fetch || !window.MATGER || !window.MATGER.routes) return;
        event.preventDefault();

        var button = form.querySelector('button');
        var original = button ? button.textContent : '';
        var loadingLabel = button ? button.getAttribute('data-loading-label') : '';
        var addedLabel = button ? button.getAttribute('data-added-label') : '';
        if (button) {
          button.disabled = true;
          button.textContent = loadingLabel || original;
        }

        fetch(window.MATGER.routes.cartAdd + '.js', {
          method: 'POST',
          body: new FormData(form),
          headers: { Accept: 'application/json' }
        })
          .then(function (response) {
            if (!response.ok) throw new Error('add failed');
            return fetch(window.MATGER.routes.cart + '.js', { headers: { Accept: 'application/json' } });
          })
          .then(function (response) { return response.json(); })
          .then(function (cart) {
            updateCartCount(cart.item_count || 0);
            if (button) button.textContent = addedLabel || original;
            window.setTimeout(function () {
              if (button) button.textContent = original;
            }, 1200);
          })
          .catch(function () {
            form.submit();
          })
          .finally(function () {
            if (button) button.disabled = false;
          });
      });
    });
  }

  function initQuantity() {
    document.querySelectorAll('[data-quantity]').forEach(function (wrap) {
      var input = wrap.querySelector('input');
      var minus = wrap.querySelector('[data-quantity-minus]');
      var plus = wrap.querySelector('[data-quantity-plus]');
      if (!input) return;

      if (minus) {
        minus.addEventListener('click', function () {
          var min = Number(input.getAttribute('min') || 0);
          input.value = Math.max(min, Number(input.value || 0) - 1);
          input.dispatchEvent(new Event('change', { bubbles: true }));
        });
      }

      if (plus) {
        plus.addEventListener('click', function () {
          input.value = Number(input.value || 0) + 1;
          input.dispatchEvent(new Event('change', { bubbles: true }));
        });
      }
    });
  }

  function initGallery() {
    document.querySelectorAll('[data-product-gallery]').forEach(function (gallery) {
      var stage = gallery.querySelector('[data-gallery-stage]');
      var thumbs = gallery.querySelectorAll('[data-gallery-thumb]');
      thumbs.forEach(function (thumb) {
        thumb.addEventListener('click', function () {
          var imageUrl = thumb.getAttribute('data-gallery-thumb');
          var image = stage ? stage.querySelector('img') : null;
          if (image && imageUrl) {
            image.src = imageUrl;
            image.removeAttribute('srcset');
            image.alt = thumb.getAttribute('aria-label') || image.alt;
          }
          thumbs.forEach(function (item) {
            item.classList.toggle('is-active', item === thumb);
          });
        });
      });
    });
  }

  function initVariants() {
    document.querySelectorAll('[data-product-form]').forEach(function (form) {
      var json = form.querySelector('[data-product-json]');
      var variantInput = form.querySelector('[data-variant-id]');
      var submit = form.querySelector('[data-product-submit]');
      var label = submit ? submit.querySelector('[data-add-label]') : null;
      if (!json || !variantInput) return;

      var variants = [];
      try { variants = JSON.parse(json.textContent); } catch (error) { return; }

      form.querySelectorAll('[data-option-position]').forEach(function (input) {
        input.addEventListener('change', function () {
          var selected = [];
          form.querySelectorAll('[data-option-position]:checked').forEach(function (checked) {
            selected[Number(checked.getAttribute('data-option-position')) - 1] = checked.value;
          });

          var variant = variants.find(function (item) {
            return item.options.every(function (option, index) { return option === selected[index]; });
          });

          if (!variant) return;
          variantInput.value = variant.id;
          if (submit) {
            submit.disabled = !variant.available;
            var addText = submit.getAttribute('data-add-text') || '';
            var soldText = submit.getAttribute('data-sold-text') || '';
            if (label) label.textContent = variant.available ? addText : soldText;
          }

          if (variant.featured_media && variant.featured_media.preview_image) {
            var stageImage = document.querySelector('[data-gallery-stage] img');
            if (stageImage) {
              stageImage.src = variant.featured_media.preview_image.src;
              stageImage.removeAttribute('srcset');
            }
          }
        });
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initSearch();
    initQuickAdd();
    initQuantity();
    initGallery();
    initVariants();
  });
})();
