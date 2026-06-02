 

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

 
  $('#spsNavbar').on('show.bs.dropdown', '.sps-dropdown', function () {
    $('#spsNavbar .sps-dropdown.show').not(this).each(function () {
      var bsInstance = bootstrap.Dropdown.getInstance(
        $(this).find('[data-bs-toggle="dropdown"]')[0]
      );
      if (bsInstance) bsInstance.hide();
    });
  });

 
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

 
  var $btnAll        = $('#btnAll');
  var $btnActiveOnly = $('#btnActiveOnly');

  $btnAll.on('click', function () {
    $btnAll.addClass('sps-btn-toggle--active').removeClass('sps-btn-toggle--outline')
           .attr('aria-pressed', 'true');
    $btnActiveOnly.addClass('sps-btn-toggle--outline').removeClass('sps-btn-toggle--active')
                  .attr('aria-pressed', 'false');
    
    $(document).trigger('sps:filterMode', ['all']);
  });

  $btnActiveOnly.on('click', function () {
    $btnActiveOnly.addClass('sps-btn-toggle--active').removeClass('sps-btn-toggle--outline')
                  .attr('aria-pressed', 'true');
    $btnAll.addClass('sps-btn-toggle--outline').removeClass('sps-btn-toggle--active')
           .attr('aria-pressed', 'false');
   
    $(document).trigger('sps:filterMode', ['active']);
  });

 
 
  $('#spsFilterForm').on('change', '.sps-select', function () {
    var $wrap = $(this).closest('.sps-select-wrap');
    if ($(this).val()) {
      $wrap.addClass('sps-select-wrap--filled');
    } else {
      $wrap.removeClass('sps-select-wrap--filled');
    } 
    $(document).trigger('sps:filterChanged', [collectPanelFilters()]);
  });
 
  $('#btnShowFilter').on('click', function () {
    $(document).trigger('sps:filterChanged', [collectPanelFilters()]);
  });
 
  $('#btnClearFilters').on('click', function () {
    $('#spsFilterForm').find('.sps-select').each(function () {
      $(this).val('');
      $(this).closest('.sps-select-wrap').removeClass('sps-select-wrap--filled');
    });
    $(document).trigger('sps:filterChanged', [collectPanelFilters()]);
  });
 
  function collectPanelFilters() {
    var filters = {};
    $('#spsFilterForm').find('.sps-select').each(function () {
      var val = $(this).val();
      filters[$(this).attr('name')] = val || null;
    });
    return filters;
  }

 
  $('#btnUploadJson').on('click', function () {
    $('#jsonFileInput').trigger('click');
  });
 
  $('#btnAddNew').on('click', function () {
    $(document).trigger('sps:addNew'); 
  });

});  