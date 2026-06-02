 

$(function () {

   
  var SEED_DATA = [
    { name:'Abdul Haseeb',    type:'Employee',         jobStatus:'Full time',  manager:'Irfan Ullah',      company:'SPS',                  team:'Operations', group:'Administration', practice:'PK',              location:'PK', mobileNo:'+92 311 5674101', email:'abdul.haseeb@gmail.com',       emergencyAccess:'No',  form:true,  status:'Active'   },
    { name:'Abid Ullah',      type:'Employee',         jobStatus:'Internship', manager:'M. Ayan Ijaz',     company:'SPS',                  team:'Technical',  group:'Operations',    practice:'AppDev',          location:'PK', mobileNo:'+92 311 5121187', email:'abid.ullah@gmnil.com',         emergencyAccess:'Yes', form:false, status:'Active'   },
    { name:'Abdul Rehman',    type:'Employee',         jobStatus:'Full time',  manager:'Usman Tufail',     company:'SPS',                  team:'Technical',  group:'Cloud',         practice:'DevOps',          location:'PK', mobileNo:'+92 307 4051222', email:'abdul.rehman@sps.net.com',     emergencyAccess:'No',  form:true,  status:'Active'   },
    { name:'Abdullah Qureshi',type:'Employee',         jobStatus:'Full time',  manager:'Maryam Tasir',     company:'SPS',                  team:'Technical',  group:'Cloud',         practice:'AppDev',          location:'PK', mobileNo:'+92 321 8762102', email:'abdullah.qureshi@sparnet.com', emergencyAccess:'Yes', form:true,  status:'Active'   },
    { name:'Abid Nasir',      type:'Employee',         jobStatus:'Full time',  manager:'Adnan Rasheed',    company:'SPS',                  team:'Technical',  group:'Cloud',         practice:'DevOps',          location:'PK', mobileNo:'+92 311 5674101', email:'abid.nasir@sparnet.com',       emergencyAccess:'Yes', form:true,  status:'Active'   },
    { name:'Abubakar Mughal', type:'Employee',         jobStatus:'Contract',   manager:'Nadeem Masood',    company:'SPS',                  team:'Sales',      group:'Public Sector', practice:'SLED-MD',         location:'PK', mobileNo:'+92 306 8053199', email:'abubakar.mughal@sparat.com',   emergencyAccess:'Yes', form:false, status:'Active'   },
    { name:'Ahman Rasheed',   type:'Employee',         jobStatus:'Full time',  manager:'Irfan Ullah',      company:'SPS',                  team:'Technical',  group:'Cloud',         practice:'DevOps',          location:'PK', mobileNo:'+92 303 5191994', email:'adnan.rasheed@sparat.com',     emergencyAccess:'Yes', form:true,  status:'Active'   },
    { name:'Ahmad Khan',      type:'Service Provider', jobStatus:'PT-Staff',   manager:'Farrukh Shahzad',  company:'Evercare Technology',  team:'Technical',  group:'Security',      practice:'Threat Management',location:'PK', mobileNo:'+92 333 1112334', email:'ahmad.khan@grand.com',         emergencyAccess:'No',  form:false, status:'Active'   },
    { name:'Ahmad Saad',      type:'Employee',         jobStatus:'Full time',  manager:'Zeeshan Zulfiqar', company:'SPS',                  team:'Technical',  group:'Cloud',         practice:'DevOps',          location:'PK', mobileNo:'+92 332 334334',  email:'ahmad.saad@grand.com',         emergencyAccess:'Yes', form:false, status:'Inactive' },
    { name:'Ahsan Gumia',     type:'Associate',        jobStatus:'Full time',  manager:'Usman Tufail',     company:'SPS',                  team:'Operations', group:'Accounting',    practice:'Corporate',       location:'PK', mobileNo:'+92 311 5674101', email:'ahsan.gumia@sparat.com',       emergencyAccess:'Yes', form:false, status:'Active'   }
  ];

 
  var state = {
    masterData   : SEED_DATA.slice(),  
    filteredData : SEED_DATA.slice(),    
    currentPage  : 1,
    perPage      : 10,
    searchQuery  : '',
    panelFilters : {},               
    activeMode   : 'all'               
  };

  /* Cached jQuery elements */
  var $masterCheck  = $('#masterCheck');
  var $tableBody    = $('#tableBody');
  var $entryCount   = $('#entryCount');
  var $showEntries  = $('#showEntries');
  var $globalSearch = $('#globalSearch');
  var $dateFrom     = $('#dateFrom');
  var $dateTo       = $('#dateTo');
  var $pagination   = $('#paginationList');

 
  $('#jsonFileInput').on('change', function () {
    var file = this.files[0];
    if (!file) return;

    // Validate file type
    if (!file.name.toLowerCase().endsWith('.json')) {
      showToast('Please select a valid .json file.', 'warning');
      return;
    }

    var reader = new FileReader();

    reader.onload = function (e) {
      try {
        var parsed = JSON.parse(e.target.result);

        // Accept either a root array or an object with an array value
        if (Array.isArray(parsed)) {
          loadDataset(parsed);
        } else if (typeof parsed === 'object') {
          // Try common wrapper keys: data, employees, records, items
          var arr = parsed.data || parsed.employees || parsed.records || parsed.items;
          if (Array.isArray(arr)) {
            loadDataset(arr);
          } else {
            throw new Error('No array found in JSON root or common wrapper keys.');
          }
        } else {
          throw new Error('JSON must be an array of employee objects.');
        }

        showToast('Dataset loaded: ' + state.masterData.length + ' employees imported.', 'success');

      } catch (err) {
        showToast('JSON parse error: ' + err.message, 'danger');
      }

      // Reset file input so same file can be re-uploaded if needed
      $('#jsonFileInput').val('');
    };

    reader.onerror = function () {
      showToast('Could not read file. Please try again.', 'danger');
    };

    reader.readAsText(file);
  });

  /* Replace masterData with new dataset and re-render everything */
  function loadDataset(arr) {
    // Normalise field names — the uploaded JSON uses camelCase keys
    state.masterData = arr.map(function (emp) {
      return {
        name            : emp.name            || emp.fullName       || '',
        type            : emp.type            || emp.employeeType   || '',
        jobStatus       : emp.jobStatus       || emp.workStatus     || '',
        manager         : emp.manager         || emp.managerName    || '',
        company         : emp.company         || emp.companyName    || '',
        team            : emp.team            || emp.teamName       || '',
        group           : emp.group           || emp.groupName      || '',
        practice        : emp.practice        || emp.practiceName   || '',
        location        : emp.location        || emp.locationCode   || '',
        mobileNo        : emp.mobileNo        || emp.mobile         || emp.phone || '',
        email           : emp.email           || '',
        emergencyAccess : emp.emergencyAccess || emp.emgAccess      || 'No',
        form            : emp.form != null    ? !!emp.form : false,
        status          : emp.status          || 'Active'
      };
    });

  
    state.searchQuery  = '';
    state.panelFilters = {};
    state.activeMode   = 'all';
    state.currentPage  = 1;
    $globalSearch.val('');

    applyAllFilters();
  }

 
  function buildRow(emp) {
    var jobBadge    = buildJobStatusBadge(emp.jobStatus);
    var emgBadge    = buildEmgBadge(emp.emergencyAccess);
    var statusBadge = buildStatusBadge(emp.status);
    var locBadge    = '<span class="sps-loc-badge">' + escapeHtml(emp.location) + '</span>';
    var formCheck   = '<input type="checkbox" class="sps-checkbox" aria-label="Form"' + (emp.form ? ' checked' : '') + '>';

    return (
      '<tr class="sps-tr">' +
        '<td class="sps-td sps-td--check">' +
          '<input type="checkbox" class="sps-checkbox sps-row-check" aria-label="Select ' + escapeHtml(emp.name) + '">' +
        '</td>' +
        '<td class="sps-td"><a href="#" class="sps-name-link">' + escapeHtml(emp.name) + '</a></td>' +
        '<td class="sps-td">' + escapeHtml(emp.type) + '</td>' +
        '<td class="sps-td">' + jobBadge + '</td>' +
        '<td class="sps-td">' + escapeHtml(emp.manager) + '</td>' +
        '<td class="sps-td">' + escapeHtml(emp.company) + '</td>' +
        '<td class="sps-td">' + escapeHtml(emp.team) + '</td>' +
        '<td class="sps-td">' + escapeHtml(emp.group) + '</td>' +
        '<td class="sps-td">' + escapeHtml(emp.practice) + '</td>' +
        '<td class="sps-td">' + locBadge + '</td>' +
        '<td class="sps-td sps-td--phone">' + escapeHtml(emp.mobileNo) + '</td>' +
        '<td class="sps-td sps-td--email">' + escapeHtml(emp.email) + '</td>' +
        '<td class="sps-td">' + emgBadge + '</td>' +
        '<td class="sps-td">' + formCheck + '</td>' +
        '<td class="sps-td">' + statusBadge + '</td>' +
        '<td class="sps-td sps-td--action">' +
          '<button class="sps-action-btn" aria-label="More actions for ' + escapeHtml(emp.name) + '">' +
            '<i class="fa-solid fa-ellipsis-vertical" aria-hidden="true"></i>' +
          '</button>' +
        '</td>' +
      '</tr>'
    );
  }

  /* Render the current page of filteredData into the tbody */
  function renderPage() {
    var start = (state.currentPage - 1) * state.perPage;
    var end   = Math.min(start + state.perPage, state.filteredData.length);
    var slice = state.filteredData.slice(start, end);

    if (slice.length === 0) {
      $tableBody.html(
        '<tr class="sps-tr"><td class="sps-td text-center text-muted py-4" colspan="16">' +
        '<i class="fa-solid fa-circle-info me-2"></i>No records match your criteria.</td></tr>'
      );
    } else {
      $tableBody.html(slice.map(buildRow).join(''));
    }

    updateEntryCount(
      state.filteredData.length,
      slice.length ? start + 1 : 0,
      end
    );

    syncMasterCheckbox();
    renderPagination();
  }

 
  function buildJobStatusBadge(status) {
    var s = (status || '').toLowerCase().trim();
    var cls = 'sps-badge ';
    if      (s === 'full time' || s === 'fulltime')   cls += 'sps-badge--fulltime';
    else if (s === 'internship' || s === 'intern')    cls += 'sps-badge--internship';
    else if (s === 'contract')                        cls += 'sps-badge--contract';
    else if (s === 'pt-staff'  || s === 'part time')  cls += 'sps-badge--ptstaff';
    else                                               cls += 'sps-badge--fulltime'; // fallback
    return '<span class="' + cls + '">' + escapeHtml(status) + '</span>';
  }

  function buildEmgBadge(val) {
    var isYes = (val || '').toLowerCase() === 'yes';
    return '<span class="sps-emg ' + (isYes ? 'sps-emg--yes' : 'sps-emg--no') + '">' +
           (isYes ? 'Yes' : 'No') + '</span>';
  }

  function buildStatusBadge(status) {
    var s   = (status || '').toLowerCase();
    var bg  = s === 'active'   ? '#1aaa55' :
              s === 'inactive' ? '#e04848' :
              s === 'on leave' ? '#e08000' : '#8a9ab0';
    return '<span class="sps-status-badge" style="background-color:' + bg + ';">' +
           escapeHtml(status) + '</span>';
  }

 
  function applyAllFilters() {
    var query  = state.searchQuery.toLowerCase();
    var pf     = state.panelFilters;
    var mode   = state.activeMode;

    state.filteredData = state.masterData.filter(function (emp) {

      /* Active-Only toggle */
      if (mode === 'active' && emp.status.toLowerCase() !== 'active') return false;

      /* Full-text search across all string fields */
      if (query) {
        var haystack = [
          emp.name, emp.type, emp.jobStatus, emp.manager,
          emp.company, emp.team, emp.group, emp.practice,
          emp.location, emp.mobileNo, emp.email, emp.emergencyAccess, emp.status
        ].join(' ').toLowerCase();
        if (haystack.indexOf(query) === -1) return false;
      }

      /* Panel dropdown filters — partial, case-insensitive match */
      if (pf.department && !fuzzyMatch(emp.team,      pf.department)) return false;
      if (pf.group      && !fuzzyMatch(emp.group,     pf.group))      return false;
      if (pf.practice   && !fuzzyMatch(emp.practice,  pf.practice))   return false;
      if (pf.location   && !fuzzyMatch(emp.location,  pf.location))   return false;
      if (pf.typeHR     && !fuzzyMatch(emp.type,      pf.typeHR))     return false;
      if (pf.workStatus && !fuzzyMatch(emp.jobStatus, pf.workStatus)) return false;
      if (pf.team       && !fuzzyMatch(emp.team,      pf.team))       return false;
      if (pf.manager    && !fuzzyMatch(emp.manager,   pf.manager))    return false;
      if (pf.jobStatus  && !fuzzyMatch(emp.status,    pf.jobStatus))  return false;

      return true;
    });

    state.currentPage = 1;
    renderPage();
  }

  /* Loose match: haystack contains the needle (case-insensitive) */
  function fuzzyMatch(haystack, needle) {
    return (haystack || '').toLowerCase().indexOf((needle || '').toLowerCase()) !== -1;
  }


  /* ═══════════════════════════════════════════════════════════════
     6. SEARCH BAR HANDLERS
     ═══════════════════════════════════════════════════════════════ */
  $('#btnSearch').on('click', function () {
    var query    = $.trim($globalSearch.val());
    var dateFrom = $.trim($dateFrom.val());
    var dateTo   = $.trim($dateTo.val());

    if (!query && !dateFrom && !dateTo) {
      showToast('Please enter a search term or date range.', 'warning');
      $globalSearch.focus();
      return;
    }

    animateButton($(this));
    state.searchQuery = query;
    applyAllFilters();

    showToast(
      query
        ? 'Results for: "' + escapeHtml(query) + '"'
        : 'Filtered by date range.',
      'success'
    );
  });

  /* Enter key inside search input triggers search */
  $globalSearch.on('keydown', function (e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      $('#btnSearch').trigger('click');
    }
  });

  /* Live filter as user types (clears search when input is cleared) */
  $globalSearch.on('input', function () {
    state.searchQuery = $.trim($(this).val());
    applyAllFilters();
  });

 
  $(document).on('sps:filterChanged', function (e, filters) {
    state.panelFilters = filters || {};
    applyAllFilters();
  }); 
  $(document).on('sps:filterMode', function (e, mode) {
    state.activeMode = mode; // 'all' or 'active'
    applyAllFilters();
    showToast(
      mode === 'active' ? 'Showing Active employees only.' : 'Showing all employees.',
      'info'
    );
  });

 
  $('#btnReset').on('click', function () {
    /* Clear search */
    $globalSearch.val('');
    $dateFrom.val('01/01/2024');
    $dateTo.val('12/31/2024');

    /* Clear panel selects */
    $('#spsFilterForm').find('.sps-select').each(function () {
      $(this).val('');
      $(this).closest('.sps-select-wrap').removeClass('sps-select-wrap--filled');
    });

    /* Clear checkboxes */
    $masterCheck.prop('checked', false).prop('indeterminate', false);

    /* Reset state */
    state.searchQuery  = '';
    state.panelFilters = {};
    state.activeMode   = 'all';
    state.currentPage  = 1;

    /* Reset toggle buttons */
    $('#btnAll').addClass('sps-btn-toggle--active').removeClass('sps-btn-toggle--outline')
                .attr('aria-pressed', 'true');
    $('#btnActiveOnly').addClass('sps-btn-toggle--outline').removeClass('sps-btn-toggle--active')
                       .attr('aria-pressed', 'false');

    applyAllFilters();
    animateButton($(this));
    showToast('All filters have been reset.', 'info');
  });

 
  $('#btnExport').on('click', function () {
    animateButton($(this));

    var dataToExport = getSelectedRows();
    if (dataToExport.length === 0) dataToExport = state.filteredData;

    var headers = ['Name','Type','Job Status','Manager','Company','Team','Group',
                   'Practice','Location','Mobile No','Email','EMG Access','Status'];

    var csvRows = [headers.join(',')];
    dataToExport.forEach(function (emp) {
      csvRows.push([
        csvCell(emp.name),    csvCell(emp.type),     csvCell(emp.jobStatus),
        csvCell(emp.manager), csvCell(emp.company),  csvCell(emp.team),
        csvCell(emp.group),   csvCell(emp.practice), csvCell(emp.location),
        csvCell(emp.mobileNo),csvCell(emp.email),    csvCell(emp.emergencyAccess),
        csvCell(emp.status)
      ].join(','));
    });

    var blob  = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    var url   = URL.createObjectURL(blob);
    var $link = $('<a>').attr({ href: url, download: 'hr_export.csv' }).appendTo('body');
    $link[0].click();
    $link.remove();
    URL.revokeObjectURL(url);

    showToast('Exported ' + dataToExport.length + ' record(s) to CSV.', 'success');
  });

  function csvCell(val) {
    var s = (val == null ? '' : String(val)).replace(/"/g, '""');
    return '"' + s + '"';
  }

  /* Return the masterData objects that correspond to checked rows */
  function getSelectedRows() {
    var names = [];
    $tableBody.find('.sps-row-check:checked').each(function () {
      names.push($(this).closest('.sps-tr').find('.sps-name-link').text().trim());
    });
    if (!names.length) return [];
    return state.filteredData.filter(function (emp) {
      return names.indexOf(emp.name) !== -1;
    });
  }

 
  function renderPagination() {
    var totalPages = Math.ceil(state.filteredData.length / state.perPage) || 1;
    var cur        = state.currentPage;
    var html       = '';

    /* First & Prev */
    html += pageBtn('«', 'pageFirst', cur <= 1);
    html += pageBtn('‹', 'pagePrev',  cur <= 1);

    /* Page numbers — show at most 5 around current page */
    var startP = Math.max(1, cur - 2);
    var endP   = Math.min(totalPages, startP + 4);
    startP     = Math.max(1, endP - 4);

    for (var p = startP; p <= endP; p++) {
      html += '<li class="page-item sps-page-item' + (p === cur ? ' active' : '') +
              '" data-page="' + p + '">' +
              '<a class="page-link sps-page-link" href="#"' +
              (p === cur ? ' aria-current="page"' : '') + '>' + p + '</a></li>';
    }

    /* Next & Last */
    html += pageBtn('›', 'pageNext', cur >= totalPages);
    html += pageBtn('»', 'pageLast', cur >= totalPages);

    $pagination.html(html);
  }

  function pageBtn(label, id, disabled) {
    return '<li class="page-item sps-page-item' + (disabled ? ' disabled' : '') +
           '" id="' + id + '">' +
           '<a class="page-link sps-page-link" href="#" aria-label="' + label + '">' +
           '<span aria-hidden="true">' + label + '</span></a></li>';
  }

  /* Delegate click on pagination list (it's re-rendered each time) */
  $pagination.on('click', 'a', function (e) {
    e.preventDefault();
    var $item = $(this).closest('.sps-page-item');
    if ($item.hasClass('disabled') || $item.hasClass('active')) return;

    var id       = $item.attr('id');
    var dataPg   = parseInt($item.data('page'), 10);
    var totalPages = Math.ceil(state.filteredData.length / state.perPage) || 1;

    if (id === 'pageFirst') state.currentPage = 1;
    else if (id === 'pageLast')  state.currentPage = totalPages;
    else if (id === 'pagePrev')  state.currentPage = Math.max(1, state.currentPage - 1);
    else if (id === 'pageNext')  state.currentPage = Math.min(totalPages, state.currentPage + 1);
    else if (!isNaN(dataPg))     state.currentPage = dataPg;

    renderPage();
  });
 
  $showEntries.on('change', function () {
    state.perPage     = parseInt($(this).val(), 10);
    state.currentPage = 1;
    renderPage();
    showToast('Showing ' + state.perPage + ' entries per page.', 'info');
  });

 
  $masterCheck.on('change', function () {
    var checked = $(this).prop('checked');
    $tableBody.find('.sps-row-check').each(function () {
      $(this).prop('checked', checked);
      toggleRowHighlight($(this));
    });
    showToast(checked ? 'All visible rows selected.' : 'All rows deselected.', 'info');
  });

  $tableBody.on('change', '.sps-row-check', function () {
    toggleRowHighlight($(this));
    syncMasterCheckbox();
  });

  function toggleRowHighlight($cb) {
    $cb.closest('.sps-tr').toggleClass('sps-row--selected', $cb.prop('checked'));
  }

  function syncMasterCheckbox() {
    var $all     = $tableBody.find('.sps-row-check');
    var $checked = $all.filter(':checked');
    if ($checked.length === 0) {
      $masterCheck.prop({ checked: false, indeterminate: false });
    } else if ($checked.length === $all.length) {
      $masterCheck.prop({ checked: true, indeterminate: false });
    } else {
      $masterCheck.prop({ checked: false, indeterminate: true });
    }
  }

 
  $tableBody.on('click', '.sps-action-btn', function (e) {
    e.stopPropagation();
    $('.sps-context-menu').remove();

    var $btn  = $(this);
    var $row  = $btn.closest('.sps-tr');
    var name  = $row.find('.sps-name-link').text().trim();

    var $menu = $(
      '<div class="sps-context-menu">' +
        '<button class="sps-ctx-item" data-action="view"><i class="fa-solid fa-eye"></i> View Details</button>' +
        '<button class="sps-ctx-item" data-action="edit"><i class="fa-solid fa-pen-to-square"></i> Edit</button>' +
        '<button class="sps-ctx-item" data-action="deactivate"><i class="fa-solid fa-user-slash"></i> Deactivate</button>' +
        '<hr class="sps-ctx-divider">' +
        '<button class="sps-ctx-item sps-ctx-item--danger" data-action="delete"><i class="fa-solid fa-trash"></i> Delete</button>' +
      '</div>'
    );

    var offset = $btn.offset();
    $menu.css({ top: offset.top + $btn.outerHeight() + 4, left: offset.left - 130 });
    $('body').append($menu);

    $menu.on('click', '.sps-ctx-item', function () {
      var action = $(this).data('action');
      $('.sps-context-menu').remove();
      handleRowAction(action, name, $row);
    });

    $(document).one('click.ctxMenu', function () { $('.sps-context-menu').remove(); });
  });

  function handleRowAction(action, name, $row) {
    var empIndex = state.filteredData.findIndex(function (e) { return e.name === name; });
    switch (action) {
      case 'view':
        showToast('Viewing details for ' + name, 'info');
        break;
      case 'edit':
        showToast('Opening edit form for ' + name, 'info');
        break;
      case 'deactivate':
        if (empIndex !== -1) state.filteredData[empIndex].status = 'Inactive';
        $row.find('.sps-status-badge').text('Inactive').css({ backgroundColor: '#e04848' });
        showToast(name + ' has been deactivated.', 'warning');
        break;
      case 'delete':
        if (window.confirm('Delete ' + name + '?')) {
          /* Remove from both arrays */
          state.masterData   = state.masterData.filter(function (e) { return e.name !== name; });
          state.filteredData = state.filteredData.filter(function (e) { return e.name !== name; });
          renderPage();
          showToast(name + ' has been deleted.', 'danger');
        }
        break;
    }
  }
 
  $tableBody.on('click', '.sps-name-link', function (e) {
    e.preventDefault();
    showToast('Opening profile for ' + $(this).text().trim(), 'info');
  });

 
  var DATE_RE = /^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/\d{4}$/;

  $('.sps-date-input').on('blur', function () {
    var val = $(this).val().trim();
    if (val && !DATE_RE.test(val)) {
      $(this).addClass('sps-date-input--error');
      showToast('Date must be MM/DD/YYYY.', 'warning');
    } else {
      $(this).removeClass('sps-date-input--error');
    }
  }).on('input', function () {
    $(this).removeClass('sps-date-input--error');
  });

 
  function updateEntryCount(total, from, to) {
    $entryCount.html(
      'Showing <strong>' + from + '</strong> to <strong>' + to +
      '</strong> of <strong>' + total + '</strong> entries'
    );
  }

  function animateButton($btn) {
    $btn.addClass('sps-btn--pulse');
    setTimeout(function () { $btn.removeClass('sps-btn--pulse'); }, 280);
  }

  function escapeHtml(str) {
    return $('<div>').text(str == null ? '' : String(str)).html();
  }

  // Array.prototype.findIndex polyfill for older environments
  if (!Array.prototype.findIndex) {
    Array.prototype.findIndex = function (fn) {
      for (var i = 0; i < this.length; i++) {
        if (fn(this[i], i, this)) return i;
      }
      return -1;
    };
  }

 
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
    var iconMap = { success:'fa-circle-check', info:'fa-circle-info',
                    warning:'fa-triangle-exclamation', danger:'fa-circle-xmark' };
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
    $toast[0].offsetHeight; // force reflow
    $toast.addClass('sps-toast--in');

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

 
  applyAllFilters();

}); // end document ready
 
 
(function injectDynamicStyles() {
  var css = `
  /* ... 80 lines of CSS ... */;
  $('<style>').text(css).appendTo('head');
/* ── Button pulse ── */
.sps-btn--pulse { transform: scale(0.94); transition: transform 0.14s ease !important; }

/* ── Date error ── */
.sps-date-input--error {
  border-color: #e04848 !important;
  box-shadow: 0 0 0 3px rgba(224,72,72,0.12) !important;
}

/* ── Context Menu ── */
.sps-context-menu {
  position: fixed; z-index: 9999;
  background: #fff; border: 1px solid #e0e6ed;
  border-radius: 8px; box-shadow: 0 6px 24px rgba(0,0,0,0.13);
  padding: 5px 0; min-width: 160px;
  animation: ctxFadeIn 0.15s ease;
}
@keyframes ctxFadeIn {
  from { opacity:0; transform:translateY(-6px); }
  to   { opacity:1; transform:translateY(0);    }
}
.sps-ctx-item {
  display:flex; align-items:center; gap:8px;
  width:100%; padding:7px 14px;
  background:none; border:none;
  font-family:"Segoe UI",system-ui,sans-serif;
  font-size:0.78rem; font-weight:500; color:#1a2d3d;
  cursor:pointer; text-align:left; transition:background 0.14s;
}
.sps-ctx-item:hover { background:#f0f8fc; color:#0076A8; }
.sps-ctx-item i { font-size:0.72rem; width:14px; text-align:center; }
.sps-ctx-item--danger { color:#b52a2a; }
.sps-ctx-item--danger:hover { background:#fff3f3; color:#9c1e1e; }
.sps-ctx-divider { border-color:#e9ecef; margin:4px 0; }

/* ── Toast Container ── */
.sps-toast-container {
  position:fixed; bottom:22px; right:22px; z-index:10000;
  display:flex; flex-direction:column; gap:8px; pointer-events:none;
}
.sps-toast {
  display:flex; align-items:center; gap:9px;
  min-width:240px; max-width:360px; padding:10px 14px;
  background:#fff; border:1px solid #e0e6ed; border-left:4px solid #0076A8;
  border-radius:8px; box-shadow:0 4px 16px rgba(0,0,0,0.12);
  font-family:"Segoe UI",system-ui,sans-serif;
  font-size:0.78rem; font-weight:500; color:#1a2d3d;
  pointer-events:all; opacity:0; transform:translateX(20px);
  transition:opacity 0.25s ease,transform 0.25s ease;
}
.sps-toast--in  { opacity:1; transform:translateX(0); }
.sps-toast--out { opacity:0; transform:translateX(20px); }
.sps-toast--success { border-left-color:#1aaa55; }
.sps-toast--info    { border-left-color:#0076A8; }
.sps-toast--warning { border-left-color:#e08000; }
.sps-toast--danger  { border-left-color:#e04848; }
.sps-toast__icon { font-size:0.9rem; flex-shrink:0; }
.sps-toast--success .sps-toast__icon { color:#1aaa55; }
.sps-toast--info    .sps-toast__icon { color:#0076A8; }
.sps-toast--warning .sps-toast__icon { color:#e08000; }
.sps-toast--danger  .sps-toast__icon { color:#e04848; }
.sps-toast__msg { flex:1; line-height:1.4; }
.sps-toast__close {
  background:none; border:none; cursor:pointer; padding:0;
  color:#8a9ab0; font-size:0.75rem; flex-shrink:0; transition:color 0.15s;
}
.sps-toast__close:hover { color:#1a2d3d; }
`;
  $('<style>').text(css).appendTo('head');
})();