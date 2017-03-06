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

  $(document).on('click', '.save_token', function() {
    var row = $(this).parents(':eq(1)'),
        button = $(this),
        data = {
          id: row.find('[data-id]').data('id'),
          token: row.find('input.token').val(),
          expire: row.find('input.expire').val(),
        };

    $.ajax({
      url: '/livestreet/save_token',
      type: 'post',
      dataType: 'json',
      data: data,
      success: function(data) {
        if (data.result) {
          button.addClass('hidden');
        }
      }
    });

  });

});
