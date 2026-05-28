/**
 * SPS-BMS Navbar & Filter Panel — script.js
 * Requires: jQuery 3+, Bootstrap 5
 *
 * Features:
 *  1. Mark the active nav link based on current URL
 *  2. Close open dropdown when another dropdown opens (accordion behaviour)
 *  3. Close all dropdowns when clicking outside the navbar
 *  4. Keyboard accessibility: Escape closes open dropdown
 *  5. Hover-open on desktop (≥ xl breakpoint), click on mobile
 *  6. Toggle buttons (All / Active Only) — wired to table filter
 *  7. Dropdown filter selects — wired to live table filter
 *  8. "Show" filter button — applies panel filters
 *  9. "Clear Filters" button — resets all panel selects
 * 10. "Import JSON" button — triggers hidden file input
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
  function isDesktop() { return window.innerWidth >= 1200; }

  $('#spsNavbar').on('mouseenter.spsHover', '.sps-dropdown', function () {
    if (!isDesktop()) return;
    var $toggle = $(this).find('[data-bs-toggle="dropdown"]');
    bootstrap.Dropdown.getOrCreateInstance($toggle[0]).show();
  });

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

  $('#spsNavbar').on('mouseenter.spsHover', '.sps-dropdown-menu', function () {
    clearTimeout($(this).closest('.sps-dropdown').data('leaveTimer'));
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


  /* ── 6. Disable hover on resize to mobile ───────────────────── */
  $(window).on('resize.spsNavbar', function () {
    if (!isDesktop()) {
      $('#spsNavbar .sps-dropdown.show').each(function () {
        var bsInstance = bootstrap.Dropdown.getInstance(
          $(this).find('[data-bs-toggle="dropdown"]')[0]
        );
        if (bsInstance) bsInstance.hide();
      });
    }
  });


  /* ══════════════════════════════════════════════════════════════
     BLOCK 1 — TOGGLE BUTTONS (All / Active Only)
     Communicates with table.js via custom event
     ══════════════════════════════════════════════════════════════ */
  var $btnAll        = $('#btnAll');
  var $btnActiveOnly = $('#btnActiveOnly');

  $btnAll.on('click', function () {
    $btnAll.addClass('sps-btn-toggle--active').removeClass('sps-btn-toggle--outline')
           .attr('aria-pressed', 'true');
    $btnActiveOnly.addClass('sps-btn-toggle--outline').removeClass('sps-btn-toggle--active')
                  .attr('aria-pressed', 'false');
    // FIX: Notify table.js to show all records (not just "Active" status)
    $(document).trigger('sps:filterMode', ['all']);
  });

  $btnActiveOnly.on('click', function () {
    $btnActiveOnly.addClass('sps-btn-toggle--active').removeClass('sps-btn-toggle--outline')
                  .attr('aria-pressed', 'true');
    $btnAll.addClass('sps-btn-toggle--outline').removeClass('sps-btn-toggle--active')
           .attr('aria-pressed', 'false');
    // FIX: Notify table.js to filter only status === 'Active'
    $(document).trigger('sps:filterMode', ['active']);
  });


  /* ══════════════════════════════════════════════════════════════
     BLOCK 3 — FILTER PANEL
     ══════════════════════════════════════════════════════════════ */

  /* FIX: Select change → immediately update "has-value" visual AND re-filter */
  $('#spsFilterForm').on('change', '.sps-select', function () {
    var $wrap = $(this).closest('.sps-select-wrap');
    if ($(this).val()) {
      $wrap.addClass('sps-select-wrap--filled');
    } else {
      $wrap.removeClass('sps-select-wrap--filled');
    }
    // Live filter on every dropdown change
    $(document).trigger('sps:filterChanged', [collectPanelFilters()]);
  });

  /* "Show" button — explicitly applies all panel filters */
  $('#btnShowFilter').on('click', function () {
    $(document).trigger('sps:filterChanged', [collectPanelFilters()]);
  });

  /* "Clear Filters" button — resets all selects and re-renders full dataset */
  $('#btnClearFilters').on('click', function () {
    $('#spsFilterForm').find('.sps-select').each(function () {
      $(this).val('');
      $(this).closest('.sps-select-wrap').removeClass('sps-select-wrap--filled');
    });
    $(document).trigger('sps:filterChanged', [collectPanelFilters()]);
  });

  /* Collect the current state of all panel filter selects */
  function collectPanelFilters() {
    var filters = {};
    $('#spsFilterForm').find('.sps-select').each(function () {
      var val = $(this).val();
      filters[$(this).attr('name')] = val || null;
    });
    return filters;
  }


  /* ══════════════════════════════════════════════════════════════
     HEADER CARD BUTTONS
     ══════════════════════════════════════════════════════════════ */

  /* FIX: "Import JSON" button → triggers hidden file input */
  $('#btnUploadJson').on('click', function () {
    $('#jsonFileInput').trigger('click');
  });

  /* FIX: "Add New" button */
  $('#btnAddNew').on('click', function () {
    $(document).trigger('sps:addNew');
    // Hook: open your modal / navigate to add-employee form here
  });

}); // end document ready