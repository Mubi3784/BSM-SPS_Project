/**
 * SPS-BMS Navbar — script.js
 * Requires: jQuery 3+, Bootstrap 5
 *
 * Features:
 *  1. Mark the active nav link based on current URL
 *  2. Close open dropdown when another dropdown opens (accordion behaviour)
 *  3. Close all dropdowns when clicking outside the navbar
 *  4. Keyboard accessibility: Escape closes open dropdown
 *  5. Hover-open on desktop (≥ xl breakpoint), click on mobile
 */

$(function () {

  /* ── 1. Highlight Active Link ───────────────────────────────── */
  var currentPath = window.location.pathname.split('/').pop() || 'index.html';

  $('#spsNavbar .sps-nav-link').each(function () {
    var href = $(this).attr('href');
    if (href && href !== '#' && href === currentPath) {
      $(this).addClass('active');
      $(this).closest('.nav-item').addClass('active');
    }
  });


  /* ── 2. Accordion Dropdowns ─────────────────────────────────── */
  // When a dropdown opens, close every other open dropdown
  $('#spsNavbar').on('show.bs.dropdown', '.sps-dropdown', function () {
    $('#spsNavbar .sps-dropdown.show').not(this).each(function () {
      var bsInstance = bootstrap.Dropdown.getInstance(
        $(this).find('[data-bs-toggle="dropdown"]')[0]
      );
      if (bsInstance) bsInstance.hide();
    });
  });


  /* ── 3. Click-Outside to Close ──────────────────────────────── */
  $(document).on('click.spsNavbar', function (e) {
    if (!$(e.target).closest('#spsNavbar').length) {
      $('#spsNavbar .sps-dropdown.show').each(function () {
        var bsInstance = bootstrap.Dropdown.getInstance(
          $(this).find('[data-bs-toggle="dropdown"]')[0]
        );
        if (bsInstance) bsInstance.hide();
      });
    }
  });


  /* ── 4. Escape Key to Close ─────────────────────────────────── */
  $(document).on('keydown.spsNavbar', function (e) {
    if (e.key === 'Escape') {
      $('#spsNavbar .sps-dropdown.show').each(function () {
        var bsInstance = bootstrap.Dropdown.getInstance(
          $(this).find('[data-bs-toggle="dropdown"]')[0]
        );
        if (bsInstance) bsInstance.hide();
      });
    }
  });


  /* ── 5. Hover-Open on Desktop (≥ 1200 px) ───────────────────── */
  function isDesktop() {
    return window.innerWidth >= 1200;
  }

  // Mouseenter: open dropdown
  $('#spsNavbar').on('mouseenter.spsHover', '.sps-dropdown', function () {
    if (!isDesktop()) return;
    var $toggle = $(this).find('[data-bs-toggle="dropdown"]');
    var bsInstance = bootstrap.Dropdown.getOrCreateInstance($toggle[0]);
    bsInstance.show();
  });

  // Mouseleave: close dropdown after a tiny delay (allows cursor travel into menu)
  $('#spsNavbar').on('mouseleave.spsHover', '.sps-dropdown', function () {
    if (!isDesktop()) return;
    var $item = $(this);
    $item.data('leaveTimer', setTimeout(function () {
      var bsInstance = bootstrap.Dropdown.getInstance(
        $item.find('[data-bs-toggle="dropdown"]')[0]
      );
      if (bsInstance) bsInstance.hide();
    }, 120));
  });

  // Re-enter the menu before timer fires? Cancel the close.
  $('#spsNavbar').on('mouseenter.spsHover', '.sps-dropdown-menu', function () {
    var $item = $(this).closest('.sps-dropdown');
    clearTimeout($item.data('leaveTimer'));
  });
  $('#spsNavbar').on('mouseleave.spsHover', '.sps-dropdown-menu', function () {
    if (!isDesktop()) return;
    var $item = $(this).closest('.sps-dropdown');
    $item.data('leaveTimer', setTimeout(function () {
      var bsInstance = bootstrap.Dropdown.getInstance(
        $item.find('[data-bs-toggle="dropdown"]')[0]
      );
      if (bsInstance) bsInstance.hide();
    }, 120));
  });


  /* ── 6. Disable hover on window resize to mobile ────────────── */
  $(window).on('resize.spsNavbar', function () {
    if (!isDesktop()) {
      // Ensure any open dropdowns are closed gracefully when resizing to mobile
      $('#spsNavbar .sps-dropdown.show').each(function () {
        var bsInstance = bootstrap.Dropdown.getInstance(
          $(this).find('[data-bs-toggle="dropdown"]')[0]
        );
        if (bsInstance) bsInstance.hide();
      });
    }
  });

}); // end document ready










// first three divs🚩

$(function () {
 
  /* ── Toggle Buttons ──────────────────────────────────────── */
  var $btnAll        = $('#btnAll');
  var $btnActiveOnly = $('#btnActiveOnly');
 
  $btnAll.on('click', function () {
    $btnAll.addClass('sps-btn-toggle--active').removeClass('sps-btn-toggle--outline')
           .attr('aria-pressed', 'true');
    $btnActiveOnly.addClass('sps-btn-toggle--outline').removeClass('sps-btn-toggle--active')
                  .attr('aria-pressed', 'false');
    // Hook: trigger your data-fetch / filter logic here
    $(document).trigger('sps:filterMode', ['all']);
  });
 
  $btnActiveOnly.on('click', function () {
    $btnActiveOnly.addClass('sps-btn-toggle--active').removeClass('sps-btn-toggle--outline')
                  .attr('aria-pressed', 'true');
    $btnAll.addClass('sps-btn-toggle--outline').removeClass('sps-btn-toggle--active')
           .attr('aria-pressed', 'false');
    $(document).trigger('sps:filterMode', ['active']);
  });
 
 
  /* ── Dropdown Change → visual "has-value" state ─────────── */
  $('.sps-select').on('change', function () {
    var $wrap = $(this).closest('.sps-select-wrap');
    if ($(this).val()) {
      $wrap.addClass('sps-select-wrap--filled');
    } else {
      $wrap.removeClass('sps-select-wrap--filled');
    }
    // Hook: re-apply filters on every change
    $(document).trigger('sps:filterChanged', [collectFilters()]);
  });
 
 
  /* ── Collect all filter values ───────────────────────────── */
  function collectFilters() {
    var filters = {};
    $('#spsFilterForm').find('.sps-select').each(function () {
      filters[$(this).attr('name')] = $(this).val() || null;
    });
    return filters;
  }
 
 
  /* ── Add New button ──────────────────────────────────────── */
  $('#btnAddNew').on('click', function () {
    $(document).trigger('sps:addNew');
    // Hook: open your modal / navigate to add-employee form here
  });
 
});