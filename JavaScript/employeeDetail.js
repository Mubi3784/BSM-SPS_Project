/**
 * SPS-BMS — employee-detail.js
 * Requires: jQuery 3+, Bootstrap 5
 *
 * Modules:
 *  1.  Form validation — Bootstrap 5 was-validated + custom checks
 *  2.  File input wiring — custom file chooser buttons
 *  3.  Select value-state class toggling
 *  4.  Add-row (+) button handlers for all dynamic tables
 *  5.  Supervisor auto-fill email
 *  6.  Loaded Cost calculator
 *  7.  Toast notification system
 *  8.  Action buttons in tables (delete rows)
 *  9.  Back button unsaved-changes guard
 */

$(function () {

  /* ═══════════════════════════════════════════════════════════════
     1. FORM VALIDATION
     ═══════════════════════════════════════════════════════════════ */

  var $form = $('#employeeDetailForm');

  $form.on('submit', function (e) {
    e.preventDefault();
    e.stopPropagation();

    var valid = true;

    // Clear previous errors
    $form.find('.ed-input, .ed-select, .ed-textarea').each(function () {
      $(this).removeClass('is-invalid');
    });

    // Check required fields
    $form.find('[required]').each(function () {
      var val = $(this).val();
      if (!val || val.trim() === '') {
        $(this).addClass('is-invalid');
        valid = false;
      }
    });

    // Email format validation
    $form.find('input[type="email"]').each(function () {
      var val = $(this).val().trim();
      if (val && !isValidEmail(val)) {
        $(this).addClass('is-invalid');
        valid = false;
      }
    });

    $form.addClass('was-validated');

    if (!valid) {
      // Scroll to first error
      var $firstError = $form.find('.is-invalid').first();
      if ($firstError.length) {
        $('html, body').animate({
          scrollTop: $firstError.offset().top - 100
        }, 350);
        $firstError.focus();
      }
      showToast('Please fill in all required fields.', 'danger');
      return;
    }

    // All valid — simulate save
    showToast('Employee details saved successfully!', 'success');
    $form.removeClass('was-validated');
  });

  // Live-clear invalid state on user input
  $form.on('input change', '.ed-input, .ed-select, .ed-textarea', function () {
    if ($(this).val() && $(this).val().trim() !== '') {
      $(this).removeClass('is-invalid');
    }
  });

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }


  /* ═══════════════════════════════════════════════════════════════
     2. CUSTOM FILE INPUT WIRING
     ═══════════════════════════════════════════════════════════════ */

  // Map each file button to its hidden input
  $(document).on('click', '.ed-file-btn', function () {
    var targetId = $(this).data('target');
    $('#' + targetId).trigger('click');
  });

  // Update displayed filename when user picks a file
  $(document).on('change', '.ed-file-input-hidden', function () {
    var id       = $(this).attr('id');
    var nameSpan = $('#' + id + 'Name');
    var file     = this.files[0];

    if (file) {
      // Truncate long names
      var display = file.name.length > 28
        ? file.name.substring(0, 25) + '...'
        : file.name;
      nameSpan.text(display).css('color', 'var(--ed-text-dark)');
    } else {
      nameSpan.text('No file chosen').css('color', 'var(--ed-text-placeholder)');
    }
  });


  /* ═══════════════════════════════════════════════════════════════
     3. SELECT VALUE-STATE CLASS
     ═══════════════════════════════════════════════════════════════ */

  // Apply 'has-value' class whenever a select has a non-empty selection
  $(document).on('change', '.ed-select', function () {
    if ($(this).val()) {
      $(this).addClass('has-value');
    } else {
      $(this).removeClass('has-value');
    }
  });

  // Initialize on page load for pre-selected values
  $('.ed-select').each(function () {
    if ($(this).val()) $(this).addClass('has-value');
  });


  /* ═══════════════════════════════════════════════════════════════
     4. ADD-ROW (+) BUTTON HANDLERS
     Each button logs a placeholder action and can be wired to
     open a modal or inline row form.
     ═══════════════════════════════════════════════════════════════ */

  var addButtonConfig = [
    { id: 'addDeptRole',    table: 'deptRolesBody',         label: 'Departmental Role'    },
    { id: 'addEmpHistory',  table: 'empHistoryBody',        label: 'Employment History'   },
    { id: 'addCustomer',    table: 'customersBody',         label: 'Customer'             },
    { id: 'addProject',     table: 'projectsBody',          label: 'Project'              },
    { id: 'addProduct',     table: 'productsBody',          label: 'Product'              },
    { id: 'addAttachment',  table: 'attachmentBody',        label: 'Attachment'           },
    { id: 'addCommSkill',   table: 'commSkillBody',         label: 'Communication Skill'  },
    { id: 'addCertification', table: 'certBody',            label: 'Certification'        },
    { id: 'addBadge',       table: 'badgeBody',             label: 'Badge'                }
  ];

  addButtonConfig.forEach(function (cfg) {
    $('#' + cfg.id).on('click', function (e) {
      e.preventDefault();
      console.log('[SPS-BMS] Add row triggered for: ' + cfg.label);
      showToast('Add ' + cfg.label + ': functionality hook ready.', 'info');
      // TODO: Open modal or insert inline editable row into #cfg.table
    });
  });


  /* ═══════════════════════════════════════════════════════════════
     5. SUPERVISOR AUTO-FILL EMAIL
     ═══════════════════════════════════════════════════════════════ */

  var supervisorEmails = {
    'Adnan Rasheed'   : 'adnan.rasheed@sps.com',
    'Farrukh Shahzad' : 'farrukh.shahzad@sps.com',
    'Irfan Ullah'     : 'irfan.ullah@sps.com',
    'M. Ayan Ijaz'    : 'm.ayan.ijaz@sps.com',
    'Maryam Tasir'    : 'maryam.tasir@sps.com',
    'Nadeem Masood'   : 'nadeem.masood@sps.com',
    'Usman Tufail'    : 'usman.tufail@sps.com',
    'Zeeshan Zulfiqar': 'zeeshan.zulfiqar@sps.com'
  };

  $('#supervisorName').on('change', function () {
    var name  = $(this).val();
    var email = supervisorEmails[name] || '';
    $('#supervisorEmail').val(email);
  });


  /* ═══════════════════════════════════════════════════════════════
     6. LOADED COST CALCULATOR
     ═══════════════════════════════════════════════════════════════ */

  function recalcLoadedCost() {
    var base       = parseFloat($('#costBaseRate').val())         || 0;
    var individual = parseFloat($('#costIndividualLoad').val())   || 0;
    var practice   = parseFloat($('#costPracticeLoad').val())     || 0;

    var loaded = base + individual + practice;

    $('#costLoadedRate').val(loaded.toFixed(2));
  }

  $('#costBaseRate, #costIndividualLoad, #costPracticeLoad').on('input', recalcLoadedCost);

  // Sync cost panel name/location from form fields
  $('#empName').on('input', function () {
    var val = $(this).val().trim();
    $('#costName').text(val || '—');
  });
  $('#empLocation').on('change', function () {
    var val = $(this).find('option:selected').text();
    $('#costLocation').text(val || '—');
  });

  $('#btnUpdateLoadedCost').on('click', function () {
    recalcLoadedCost();
    animateButton($(this));
    showToast('Loaded rate updated successfully.', 'success');
  });


  /* ═══════════════════════════════════════════════════════════════
     7. TABLE DELETE BUTTONS (delegated)
     ═══════════════════════════════════════════════════════════════ */

  $(document).on('click', '.ed-tbl-btn--del', function (e) {
    e.stopPropagation();
    var $btn = $(this);
    var $row = $btn.closest('tr');
    var rowLabel = $row.find('td').eq(1).text().trim() || 'this row';

    if (window.confirm('Remove "' + rowLabel + '" from this list?')) {
      $row.fadeOut(220, function () {
        $row.remove();
        showToast('"' + rowLabel + '" removed.', 'warning');
      });
    }
  });


  /* ═══════════════════════════════════════════════════════════════
     8. BACK BUTTON UNSAVED-CHANGES GUARD
     ═══════════════════════════════════════════════════════════════ */

  var formDirty = false;

  $form.on('input change', function () {
    formDirty = true;
  });

  $('.ed-btn-back').on('click', function (e) {
    if (formDirty) {
      if (!window.confirm('You have unsaved changes. Leave page?')) {
        e.preventDefault();
      }
    }
  });

  $(window).on('beforeunload', function () {
    if (formDirty) return 'You have unsaved changes.';
  });

  // Clear dirty flag on successful save
  $('#btnSaveEmployee').on('click', function () {
    // Dirty flag reset happens after save toast fires
    setTimeout(function () { formDirty = false; }, 500);
  });


  /* ═══════════════════════════════════════════════════════════════
     HELPERS
     ═══════════════════════════════════════════════════════════════ */

  function animateButton($btn) {
    $btn.css('transform', 'scale(0.95)');
    setTimeout(function () { $btn.css('transform', ''); }, 160);
  }


  /* ═══════════════════════════════════════════════════════════════
     9. TOAST NOTIFICATION SYSTEM
     ═══════════════════════════════════════════════════════════════ */

  var $toastContainer;

  function ensureToastContainer() {
    if (!$toastContainer || !$toastContainer.length || !$.contains(document, $toastContainer[0])) {
      $toastContainer = $('<div id="edToastContainer" style="' +
        'position:fixed;bottom:22px;right:22px;z-index:10500;' +
        'display:flex;flex-direction:column;gap:8px;pointer-events:none;' +
        '"></div>');
      $('body').append($toastContainer);
    }
  }

  function showToast(message, type) {
    ensureToastContainer();
    type = type || 'info';

    var iconMap = {
      success : 'fa-circle-check',
      info    : 'fa-circle-info',
      warning : 'fa-triangle-exclamation',
      danger  : 'fa-circle-xmark'
    };
    var colorMap = {
      success : '#1aaa55',
      info    : '#0076A8',
      warning : '#e08000',
      danger  : '#e04848'
    };
    var icon  = iconMap[type]  || 'fa-circle-info';
    var color = colorMap[type] || '#0076A8';

    var toastStyle = [
      'display:flex;align-items:center;gap:9px;',
      'min-width:240px;max-width:360px;padding:10px 14px;',
      'background:#fff;border:1px solid #e0e6ed;border-left:4px solid ' + color + ';',
      'border-radius:8px;box-shadow:0 4px 16px rgba(0,0,0,0.12);',
      'font-family:"Segoe UI",system-ui,sans-serif;font-size:0.78rem;',
      'font-weight:500;color:#1a2d3d;pointer-events:all;',
      'opacity:0;transform:translateX(20px);',
      'transition:opacity 0.25s ease,transform 0.25s ease;'
    ].join('');

    var $toast = $(
      '<div style="' + toastStyle + '">' +
        '<i class="fa-solid ' + icon + '" style="font-size:0.9rem;flex-shrink:0;color:' + color + ';"></i>' +
        '<span style="flex:1;line-height:1.4;">' + message + '</span>' +
        '<button style="background:none;border:none;cursor:pointer;padding:0;' +
          'color:#8a9ab0;font-size:0.75rem;flex-shrink:0;" aria-label="Close">' +
          '<i class="fa-solid fa-xmark"></i>' +
        '</button>' +
      '</div>'
    );

    $toastContainer.append($toast);
    $toast[0].offsetHeight; // force reflow
    $toast.css({ opacity: '1', transform: 'translateX(0)' });

    var timer = setTimeout(function () { dismissToast($toast); }, 3800);

    $toast.find('button').on('click', function () {
      clearTimeout(timer);
      dismissToast($toast);
    });
  }

  function dismissToast($t) {
    $t.css({ opacity: '0', transform: 'translateX(20px)' });
    setTimeout(function () { $t.remove(); }, 280);
  }

}); // end document ready