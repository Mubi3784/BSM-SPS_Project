/**
 * SPS-BMS HR Dashboard — table.js
 * Requires: jQuery 3+, Bootstrap 5
 *
 * Modules:
 *  1.  Master checkbox — toggle all row checkboxes
 *  2.  Row checkbox — sync master checkbox state
 *  3.  Row selection — highlight selected rows
 *  4.  Search button handler
 *  5.  Reset button handler
 *  6.  Export button handler
 *  7.  Search input — live client-side row filter
 *  8.  Show entries dropdown — slice visible rows
 *  9.  Pagination — client-side page navigation
 * 10.  Action (⋮) button — contextual dropdown menu
 * 11.  Name link — clickable row detail handler
 * 12.  Date input — basic format validation
 */

$(function () {

  /* ───────────────────────────────────────────────────────────
     STATE
  ─────────────────────────────────────────────────────────── */
  var state = {
    totalEntries : 125,
    currentPage  : 1,
    perPage      : 10,
    totalPages   : 13,        // ceil(125/10)
    searchQuery  : '',
    allRows      : []         // cached jQuery row collection
  };

  /* Cache frequently-used elements */
  var $masterCheck  = $('#masterCheck');
  var $tableBody    = $('#tableBody');
  var $entryCount   = $('#entryCount');
  var $showEntries  = $('#showEntries');
  var $globalSearch = $('#globalSearch');
  var $dateFrom     = $('#dateFrom');
  var $dateTo       = $('#dateTo');


  /* ───────────────────────────────────────────────────────────
     1. MASTER CHECKBOX — toggle all row checkboxes
  ─────────────────────────────────────────────────────────── */
  $masterCheck.on('change', function () {
    var isChecked = $(this).prop('checked');

    $tableBody.find('.sps-row-check').each(function () {
      $(this).prop('checked', isChecked);
      toggleRowHighlight($(this));
    });

    showToast(
      isChecked
        ? 'All visible rows selected.'
        : 'All rows deselected.',
      'info'
    );
  });


  /* ───────────────────────────────────────────────────────────
     2 & 3. ROW CHECKBOX — sync master + highlight row
  ─────────────────────────────────────────────────────────── */
  $tableBody.on('change', '.sps-row-check', function () {
    toggleRowHighlight($(this));
    syncMasterCheckbox();
  });

  function toggleRowHighlight($checkbox) {
    $checkbox.closest('.sps-tr').toggleClass(
      'sps-row--selected',
      $checkbox.prop('checked')
    );
  }

  function syncMasterCheckbox() {
    var $allRows     = $tableBody.find('.sps-row-check');
    var $checkedRows = $allRows.filter(':checked');

    if ($checkedRows.length === 0) {
      $masterCheck.prop('checked', false).prop('indeterminate', false);
    } else if ($checkedRows.length === $allRows.length) {
      $masterCheck.prop('checked', true).prop('indeterminate', false);
    } else {
      $masterCheck.prop('checked', false).prop('indeterminate', true);
    }
  }


  /* ───────────────────────────────────────────────────────────
     4. SEARCH BUTTON HANDLER
  ─────────────────────────────────────────────────────────── */
  $('#btnSearch').on('click', function () {
    var query    = $.trim($globalSearch.val());
    var dateFrom = $.trim($dateFrom.val());
    var dateTo   = $.trim($dateTo.val());

    if (!query && !dateFrom && !dateTo) {
      showToast('Please enter a search term or date range.', 'warning');
      $globalSearch.focus();
      return;
    }

    // Pulse the button to give visual feedback
    animateButton($(this));

    // Run the client-side filter
    applyClientFilter(query);

    showToast(
      query
        ? 'Showing results for: "' + escapeHtml(query) + '"'
        : 'Filtered by date range: ' + dateFrom + ' – ' + dateTo,
      'success'
    );

    // Hook: replace with your real AJAX call
    // $.ajax({ url: '/api/hr', data: { q: query, from: dateFrom, to: dateTo }, ... });
  });

  // Also trigger search on Enter key inside search input
  $globalSearch.on('keydown', function (e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      $('#btnSearch').trigger('click');
    }
  });


  /* ───────────────────────────────────────────────────────────
     5. RESET BUTTON HANDLER
  ─────────────────────────────────────────────────────────── */
  $('#btnReset').on('click', function () {
    // Clear inputs
    $globalSearch.val('');
    $dateFrom.val('01/01/2024');
    $dateTo.val('12/31/2024');

    // Clear checkboxes
    $masterCheck.prop('checked', false).prop('indeterminate', false);
    $tableBody.find('.sps-row-check').prop('checked', false);
    $tableBody.find('.sps-tr').removeClass('sps-row--selected');

    // Show all rows
    $tableBody.find('.sps-tr').show();

    // Reset pagination display
    state.searchQuery = '';
    updateEntryCount(state.totalEntries, 1, state.perPage);
    setActivePage(1);

    animateButton($(this));
    showToast('Filters have been reset.', 'info');

    // Hook: trigger a fresh data fetch
    // $(document).trigger('sps:tableReset');
  });


  /* ───────────────────────────────────────────────────────────
     6. EXPORT BUTTON HANDLER
  ─────────────────────────────────────────────────────────── */
  $('#btnExport').on('click', function () {
    animateButton($(this));

    var selectedCount = $tableBody.find('.sps-row-check:checked').length;
    var scope = selectedCount > 0
      ? selectedCount + ' selected row(s)'
      : 'all 125 entries';

    showToast('Preparing export for ' + scope + '…', 'info');

    // Hook: real CSV/Excel export
    // window.location = '/api/hr/export?q=' + encodeURIComponent($globalSearch.val());

    // Simulate a short delay then confirm
    setTimeout(function () {
      showToast('Export ready. Download started.', 'success');
    }, 1200);
  });


  /* ───────────────────────────────────────────────────────────
     7. LIVE CLIENT-SIDE ROW FILTER
  ─────────────────────────────────────────────────────────── */
  function applyClientFilter(query) {
    state.searchQuery = query.toLowerCase();
    var $rows         = $tableBody.find('.sps-tr');
    var visibleCount  = 0;

    $rows.each(function () {
      var rowText = $(this).text().toLowerCase();
      var show    = !state.searchQuery || rowText.indexOf(state.searchQuery) !== -1;
      $(this).toggle(show);
      if (show) visibleCount++;
    });

    updateEntryCount(visibleCount, 1, Math.min(state.perPage, visibleCount));
    resetMasterCheckOnFilter();
  }

  $globalSearch.on('input', function () {
    var query = $.trim($(this).val());
    if (query.length === 0) {
      // Cleared — show all
      $tableBody.find('.sps-tr').show();
      updateEntryCount(state.totalEntries, 1, state.perPage);
      resetMasterCheckOnFilter();
    }
  });

  function resetMasterCheckOnFilter() {
    $masterCheck.prop('checked', false).prop('indeterminate', false);
    $tableBody.find('.sps-row-check').prop('checked', false);
    $tableBody.find('.sps-tr').removeClass('sps-row--selected');
  }


  /* ───────────────────────────────────────────────────────────
     8. SHOW ENTRIES DROPDOWN
  ─────────────────────────────────────────────────────────── */
  $showEntries.on('change', function () {
    var newPerPage = parseInt($(this).val(), 10);
    state.perPage  = newPerPage;
    state.totalPages = Math.ceil(state.totalEntries / newPerPage);

    // On a real implementation you'd re-fetch from the server.
    // Here we simply update the display text and reset to page 1.
    state.currentPage = 1;
    updateEntryCount(state.totalEntries, 1, newPerPage);
    setActivePage(1);

    showToast('Showing ' + newPerPage + ' entries per page.', 'info');

    // Hook: real data fetch
    // $(document).trigger('sps:perPageChanged', [newPerPage]);
  });


  /* ───────────────────────────────────────────────────────────
     9. PAGINATION — client-side page navigation
  ─────────────────────────────────────────────────────────── */
  // Number page clicks
  $(document).on('click', '.sps-page-item[data-page] .sps-page-link', function (e) {
    e.preventDefault();
    var page = parseInt($(this).closest('.sps-page-item').data('page'), 10);
    if (!page) return;
    navigateTo(page);
  });

  // First
  $('#pageFirst').on('click', 'a', function (e) {
    e.preventDefault();
    navigateTo(1);
  });
  // Last
  $('#pageLast').on('click', 'a', function (e) {
    e.preventDefault();
    navigateTo(state.totalPages);
  });
  // Prev
  $('#pagePrev').on('click', 'a', function (e) {
    e.preventDefault();
    if (state.currentPage > 1) navigateTo(state.currentPage - 1);
  });
  // Next
  $('#pageNext').on('click', 'a', function (e) {
    e.preventDefault();
    if (state.currentPage < state.totalPages) navigateTo(state.currentPage + 1);
  });

  function navigateTo(page) {
    if (page < 1 || page > state.totalPages || page === state.currentPage) return;

    state.currentPage = page;
    setActivePage(page);

    var from = (page - 1) * state.perPage + 1;
    var to   = Math.min(page * state.perPage, state.totalEntries);
    updateEntryCount(state.totalEntries, from, to);

    // Hook: real AJAX page fetch
    // $(document).trigger('sps:pageChanged', [page]);
  }

  function setActivePage(page) {
    $('.sps-page-item[data-page]').each(function () {
      var $item = $(this);
      var p     = parseInt($item.data('page'), 10);
      $item.toggleClass('active', p === page);
      if (p === page) {
        $item.find('.sps-page-link').attr('aria-current', 'page');
      } else {
        $item.find('.sps-page-link').removeAttr('aria-current');
      }
    });

    // Disable First/Prev on page 1
    $('#pageFirst, #pagePrev').toggleClass('disabled', page <= 1);
    // Disable Next/Last on last page
    $('#pageNext, #pageLast').toggleClass('disabled', page >= state.totalPages);
  }


  /* ───────────────────────────────────────────────────────────
     10. ACTION (⋮) BUTTON — simple context menu
  ─────────────────────────────────────────────────────────── */
  $tableBody.on('click', '.sps-action-btn', function (e) {
    e.stopPropagation();
    var $btn   = $(this);
    var $row   = $btn.closest('.sps-tr');
    var name   = $row.find('.sps-name-link').text().trim();

    // Remove any existing context menu
    $('.sps-context-menu').remove();

    var $menu = $('<div class="sps-context-menu">' +
      '<button class="sps-ctx-item" data-action="view"><i class="fa-solid fa-eye"></i> View Details</button>' +
      '<button class="sps-ctx-item" data-action="edit"><i class="fa-solid fa-pen-to-square"></i> Edit</button>' +
      '<button class="sps-ctx-item" data-action="deactivate"><i class="fa-solid fa-user-slash"></i> Deactivate</button>' +
      '<hr class="sps-ctx-divider">' +
      '<button class="sps-ctx-item sps-ctx-item--danger" data-action="delete"><i class="fa-solid fa-trash"></i> Delete</button>' +
    '</div>');

    // Position the menu below the button
    var offset = $btn.offset();
    var btnH   = $btn.outerHeight();
    $menu.css({
      top  : offset.top + btnH + 4,
      left : offset.left - 130,
    });

    $('body').append($menu);

    // Context menu item click
    $menu.on('click', '.sps-ctx-item', function () {
      var action = $(this).data('action');
      $('.sps-context-menu').remove();
      handleRowAction(action, name, $row);
    });

    // Close on outside click
    $(document).one('click.ctxMenu', function () {
      $('.sps-context-menu').remove();
    });
  });

  function handleRowAction(action, name, $row) {
    switch (action) {
      case 'view':
        showToast('Viewing details for ' + name, 'info');
        // $(document).trigger('sps:viewEmployee', [name]);
        break;
      case 'edit':
        showToast('Opening edit form for ' + name, 'info');
        // $(document).trigger('sps:editEmployee', [name]);
        break;
      case 'deactivate':
        showToast(name + ' has been deactivated.', 'warning');
        $row.find('.sps-status-badge')
            .text('Inactive')
            .css({ backgroundColor: '#e04848' });
        break;
      case 'delete':
        if (window.confirm('Are you sure you want to delete ' + name + '?')) {
          $row.fadeOut(320, function () { $(this).remove(); });
          showToast(name + ' has been deleted.', 'danger');
        }
        break;
    }
  }


  /* ───────────────────────────────────────────────────────────
     11. NAME LINK — clickable row detail
  ─────────────────────────────────────────────────────────── */
  $tableBody.on('click', '.sps-name-link', function (e) {
    e.preventDefault();
    var name = $(this).text().trim();
    showToast('Opening profile for ' + name, 'info');
    // $(document).trigger('sps:viewEmployee', [name]);
  });


  /* ───────────────────────────────────────────────────────────
     12. DATE INPUT — basic MM/DD/YYYY validation + mask
  ─────────────────────────────────────────────────────────── */
  $('.sps-date-input').on('blur', function () {
    var val     = $(this).val().trim();
    var pattern = /^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/\d{4}$/;
    if (val && !pattern.test(val)) {
      $(this).addClass('sps-date-input--error');
      showToast('Date format must be MM/DD/YYYY.', 'warning');
    } else {
      $(this).removeClass('sps-date-input--error');
    }
  });

  $('.sps-date-input').on('input', function () {
    $(this).removeClass('sps-date-input--error');
  });


  /* ───────────────────────────────────────────────────────────
     HELPERS
  ─────────────────────────────────────────────────────────── */

  /* Update the "Showing X to Y of Z entries" text */
  function updateEntryCount(total, from, to) {
    $entryCount.html(
      'Showing <strong>' + from + '</strong> to <strong>' + to +
      '</strong> of <strong>' + total + '</strong> entries'
    );
  }

  /* Momentary scale animation on a button */
  function animateButton($btn) {
    $btn.addClass('sps-btn--pulse');
    setTimeout(function () { $btn.removeClass('sps-btn--pulse'); }, 280);
  }

  /* Simple XSS-safe string escaper */
  function escapeHtml(str) {
    return $('<div>').text(str).html();
  }

  /* ── Toast Notification ── */
  var $toastContainer;

  function ensureToastContainer() {
    if (!$toastContainer || !$toastContainer.length) {
      $toastContainer = $('<div id="spsToastContainer" class="sps-toast-container"></div>');
      $('body').append($toastContainer);
    }
  }

  function showToast(message, type) {
    ensureToastContainer();
    type = type || 'info';

    var iconMap = {
      success: 'fa-circle-check',
      info:    'fa-circle-info',
      warning: 'fa-triangle-exclamation',
      danger:  'fa-circle-xmark'
    };
    var icon = iconMap[type] || 'fa-circle-info';

    var $toast = $(
      '<div class="sps-toast sps-toast--' + type + '">' +
        '<i class="fa-solid ' + icon + ' sps-toast__icon"></i>' +
        '<span class="sps-toast__msg">' + message + '</span>' +
        '<button class="sps-toast__close" aria-label="Close">' +
          '<i class="fa-solid fa-xmark"></i>' +
        '</button>' +
      '</div>'
    );

    $toastContainer.append($toast);
    // Trigger reflow for CSS transition
    $toast[0].offsetHeight; // eslint-disable-line no-unused-expressions
    $toast.addClass('sps-toast--in');

    // Auto-dismiss
    var timer = setTimeout(function () { dismissToast($toast); }, 3500);

    $toast.find('.sps-toast__close').on('click', function () {
      clearTimeout(timer);
      dismissToast($toast);
    });
  }

  function dismissToast($toast) {
    $toast.removeClass('sps-toast--in').addClass('sps-toast--out');
    setTimeout(function () { $toast.remove(); }, 350);
  }


  /* ───────────────────────────────────────────────────────────
     INITIALISE
  ─────────────────────────────────────────────────────────── */
  setActivePage(1);   // Mark page 1 active; disable First/Prev
  syncMasterCheckbox();

});


/* ============================================================
   SUPPLEMENTARY STYLES injected by JS
   (avoids requiring a separate CSS file for toast/context menu)
   ============================================================ */
(function injectDynamicStyles() {
  var css = `
/* ── Button pulse animation ── */
.sps-btn--pulse {
  transform: scale(0.94);
  transition: transform 0.14s ease !important;
}

/* ── Date input error ── */
.sps-date-input--error {
  border-color: #e04848 !important;
  box-shadow: 0 0 0 3px rgba(224, 72, 72, 0.12) !important;
}

/* ── Context Menu ── */
.sps-context-menu {
  position: fixed;
  z-index: 9999;
  background: #ffffff;
  border: 1px solid #e0e6ed;
  border-radius: 8px;
  box-shadow: 0 6px 24px rgba(0,0,0,0.13);
  padding: 5px 0;
  min-width: 160px;
  animation: ctxFadeIn 0.15s ease;
}
@keyframes ctxFadeIn {
  from { opacity: 0; transform: translateY(-6px); }
  to   { opacity: 1; transform: translateY(0);    }
}
.sps-ctx-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 7px 14px;
  background: none;
  border: none;
  font-family: "Segoe UI", system-ui, sans-serif;
  font-size: 0.78rem;
  font-weight: 500;
  color: #1a2d3d;
  cursor: pointer;
  text-align: left;
  transition: background 0.14s;
}
.sps-ctx-item:hover { background: #f0f8fc; color: #0076A8; }
.sps-ctx-item i { font-size: 0.72rem; width: 14px; text-align: center; }
.sps-ctx-item--danger { color: #b52a2a; }
.sps-ctx-item--danger:hover { background: #fff3f3; color: #9c1e1e; }
.sps-ctx-divider { border-color: #e9ecef; margin: 4px 0; }

/* ── Toast Container ── */
.sps-toast-container {
  position: fixed;
  bottom: 22px;
  right: 22px;
  z-index: 10000;
  display: flex;
  flex-direction: column;
  gap: 8px;
  pointer-events: none;
}
.sps-toast {
  display: flex;
  align-items: center;
  gap: 9px;
  min-width: 240px;
  max-width: 360px;
  padding: 10px 14px;
  background: #fff;
  border: 1px solid #e0e6ed;
  border-left: 4px solid #0076A8;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.12);
  font-family: "Segoe UI", system-ui, sans-serif;
  font-size: 0.78rem;
  font-weight: 500;
  color: #1a2d3d;
  pointer-events: all;
  opacity: 0;
  transform: translateX(20px);
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.sps-toast--in  { opacity: 1; transform: translateX(0); }
.sps-toast--out { opacity: 0; transform: translateX(20px); }
.sps-toast--success { border-left-color: #1aaa55; }
.sps-toast--info    { border-left-color: #0076A8; }
.sps-toast--warning { border-left-color: #e08000; }
.sps-toast--danger  { border-left-color: #e04848; }
.sps-toast__icon {
  font-size: 0.9rem;
  flex-shrink: 0;
}
.sps-toast--success .sps-toast__icon { color: #1aaa55; }
.sps-toast--info    .sps-toast__icon { color: #0076A8; }
.sps-toast--warning .sps-toast__icon { color: #e08000; }
.sps-toast--danger  .sps-toast__icon { color: #e04848; }
.sps-toast__msg { flex: 1; line-height: 1.4; }
.sps-toast__close {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  color: #8a9ab0;
  font-size: 0.75rem;
  flex-shrink: 0;
  transition: color 0.15s;
}
.sps-toast__close:hover { color: #1a2d3d; }
`;
  var $style = $('<style>').text(css);
  $('head').append($style);
})();