(function () {
  function initMobileMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var menu = document.querySelector('[data-mobile-menu]');
    var close = document.querySelector('[data-menu-close]');

    if (!toggle || !menu) return;

    function openMenu() {
      menu.hidden = false;
      toggle.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
      menu.hidden = true;
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }

    toggle.addEventListener('click', openMenu);
    if (close) close.addEventListener('click', closeMenu);
    menu.addEventListener('click', function (event) {
      if (event.target === menu) closeMenu();
    });
  }

  function initQuantityControls(scope) {
    scope.querySelectorAll('.quantity-control').forEach(function (control) {
      var input = control.querySelector('input[type="number"]');
      var minus = control.querySelector('[data-quantity-minus]');
      var plus = control.querySelector('[data-quantity-plus]');

      if (!input) return;

      if (minus) {
        minus.addEventListener('click', function () {
          var min = Number(input.getAttribute('min') || 0);
          var value = Math.max(min, Number(input.value || 0) - 1);
          input.value = value;
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

  function initProductGallery() {
    document.querySelectorAll('[data-product-gallery]').forEach(function (gallery) {
      var slides = gallery.querySelectorAll('[data-gallery-slide]');
      var thumbs = gallery.querySelectorAll('[data-gallery-thumb]');

      thumbs.forEach(function (thumb) {
        thumb.addEventListener('click', function () {
          var index = thumb.getAttribute('data-gallery-thumb');
          slides.forEach(function (slide) {
            slide.classList.toggle('is-active', slide.getAttribute('data-gallery-slide') === index);
          });
          thumbs.forEach(function (item) {
            item.classList.toggle('is-active', item === thumb);
          });
        });
      });
    });
  }

  function initVariantPickers() {
    document.querySelectorAll('.product-form').forEach(function (form) {
      var json = form.querySelector('[data-product-json]');
      var select = form.querySelector('[data-variant-select]');
      var submit = form.querySelector('.product-form__submit');
      var checkout = form.querySelector('.product-detail-form__checkout');
      if (!json || !select) return;

      var variants = [];
      try {
        variants = JSON.parse(json.textContent);
      } catch (error) {
        return;
      }

      form.querySelectorAll('[data-option-position]').forEach(function (input) {
        input.addEventListener('change', function () {
          var selected = [];
          form.querySelectorAll('[data-option-position]:checked').forEach(function (checked) {
            selected[Number(checked.getAttribute('data-option-position')) - 1] = checked.value;
          });

          var variant = variants.find(function (item) {
            return item.options.every(function (option, index) {
              return option === selected[index];
            });
          });

          if (!variant) return;
          select.value = variant.id;

          if (submit) {
            submit.disabled = !variant.available;
            submit.textContent = variant.available ? 'Add to Cart' : 'Sold Out';
          }

          if (checkout) {
            checkout.disabled = !variant.available;
          }
        });
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMobileMenu();
    initQuantityControls(document);
    initProductGallery();
    initVariantPickers();
  });
})();
