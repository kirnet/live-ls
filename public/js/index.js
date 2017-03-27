'use strict';

var lls = lls || {};

lls.deletedomain = function(domain) {
  var row = $('table.domains').find('.domain[value="' + domain +'"]').parents(':eq(1)');
  $.ajax({
    url: '/livestreet/delete_domain',
    type: 'delete',
    dataType: 'json',
    data: {
      domain: domain
    },
    success: function(data) {
      if (data.result) {
        row.remove();
      }
      console.log(data);
    }
  });
};

lls.prettyJson = function(json, pretty) {
  if (!json) return '';
  if (pretty) {
    return JSON.stringify(JSON.parse(json), null, 4);
  }
  return JSON.stringify(JSON.parse(json));
};

$(function() {
  $(document).on('click', '.send_domain', function() {
    //var form = $('.new_domain').serialize();
    $('.new_domain').submit();
  });

  $(document).on('click', '.delete_domain', function() {
    var domain = $(this).data('domain'),
        modalDialog = $('#confirm_dialog');

    modalDialog.modal('show').find('#confirm_data').data('domain', domain);
    $('.confirm_yes').off().on('click', function() {
      lls.deletedomain(domain);
      modalDialog.modal('hide');
    });
  });

  $(document).on('keyup change', '.show_save', function() {
    $(this).parents(':eq(1)').find('button.hidden').removeClass('hidden');
  });

  $(document).on('focus', '.rules', function() {
    var domain = $(this).parents(':eq(1)').find('.domain').val(),
        editJson = $('#edit_json');
    editJson.modal('show');
    editJson.find('#domain').val(domain);
    $('.edit_json').val(lls.prettyJson($(this).val(), true));
  });

  $(document).on('click', '.save_json', function() {
    var editJson = $('#edit_json'),
        domain = editJson.find('#domain').val(),
        tr = $('table.domains').find('.domain[value="'+ domain +'"]').parents(':eq(1)');

    tr.find('.rules').val(lls.prettyJson($('.edit_json').val()));
    tr.find('.save_domain').click();
    editJson.modal('toggle');
  });

  $(document).on('click', '.save_domain', function() {
    var row = $(this).parents(':eq(1)'),
        button = $(this);

    $.ajax({
      url: '/livestreet/save_domain',
      type: 'post',
      dataType: 'json',
      data: {
        id: row.find('[data-id]').data('id'),
        domain: row.find('input.domain').val(),
        expire: row.find('input.expire').val(),
        rules: row.find('input.rules').val(),
        maxCounter: row.find('input.max_counter').val()
      },
      success: function(data) {
        if (data.result) {
          button.addClass('hidden');
          $.toast({
            text: 'Успешно сохранено',
            showHideTransition: 'fade',
            position : 'top-right',
            icon: 'info'
          });
        }
        else {
          $.toast({
            heading: 'Error',
            text: data.message,
            showHideTransition: 'fade',
            icon: 'error',
            position : 'top-right'
          });
        }
      }
    });

  });

  $('.sort_domain').click(function() {
    var sort = $(this).data('sort'),
      params;

    if (sort == 1) {
      sort = -1;
    }
    else {
      sort = 1;
    }
    $(this).data('sort', sort);
    params = lls.addUrlParams({sort: '{"domain":"' + sort +'"}'});
    window.location.href = params;
    console.log(params);
    return false;
  });

  $('.expire').datepicker({
    regional: 'ru'
  });

  $('#filter_domain').on('keypress', function(event) {
    if (event.keyCode == 13) {
      var domain = $(this).val();
      window.location.href = lls.addUrlParams({filter:{'domain':domain}});
      //console.log()
    }

  });

}); //autoRun
