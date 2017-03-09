'use strict';

var lls = {};

lls.deleteToken = function(tokenId) {
  var row = $('table.tokens').find('.id[data-id=' +tokenId +']').parent();
  $.ajax({
    url: '/livestreet/delete_token',
    type: 'delete',
    dataType: 'json',
    data: {
      id: tokenId
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
  if (pretty) {
    return JSON.stringify(JSON.parse(json), null, 4);
  }
  return JSON.stringify(JSON.parse(json));
}

$(function() {
  $(document).on('click', '.send_token', function() {
    //var form = $('.new_token').serialize();
    $('.new_token').submit();
  });

  $(document).on('click', '.delete_token', function() {
    var tokenId = $(this).data('token_id'),
        modalDialog = $('#confirm_dialog');

    modalDialog.modal('show').find('#confirm_data').data('token_id', tokenId);
    $('.confirm_yes').off().on('click', function() {
      lls.deleteToken(tokenId);
      modalDialog.modal('hide');
    });
  });

  $(document).on('keyup', '.show_save', function() {
    $(this).parents(':eq(1)').find('button.hidden').removeClass('hidden');
  });

  $(document).on('focus', '.rules', function() {
    var tokenId = $(this).parents(':eq(1)').find('.id').data('id'),
        editJson = $('#edit_json');
    editJson.modal('show');
    editJson.find('#token_id').val(tokenId);
    $('.edit_json').val(lls.prettyJson($(this).val(), true));
  });

  $(document).on('click', '.save_json', function() {
    var editJson = $('#edit_json'),
        tokenId = editJson.find('#token_id').val(),
        tr = $('table.tokens').find('.id[data-id='+ tokenId +']').parent();

    tr.find('.rules').val(lls.prettyJson($('.edit_json').val()));
    tr.find('.save_token').click();
    editJson.modal('toggle');
  });

  $(document).on('click', '.save_token', function() {
    var row = $(this).parents(':eq(1)'),
        button = $(this);

    $.ajax({
      url: '/livestreet/save_token',
      type: 'post',
      dataType: 'json',
      data: {
        id: row.find('[data-id]').data('id'),
        token: row.find('input.token').val(),
        expire: row.find('input.expire').val(),
        rules: row.find('input.rules').val()
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

});
