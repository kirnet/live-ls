'use strict';

var lls = lls || {};

$(function() {
  $('#settings-tab').tab('show');
  $('#change_pass').on('click', function() {
    var oldPass = $('#old_pass'),
        newPass = $('#new_pass'),
        confirmPass = $('#confirm_pass'),
        isValid = true;

    $([oldPass, newPass, confirmPass]).each(function(index, input) {
      if (!input.val()) {
        $.toast({
          heading: 'Error',
          text: 'Не все поля заполнены',
          showHideTransition: 'fade',
          icon: 'error',
          position : 'top-right'
        });
        input.focus();
        isValid = false;
        return false;
      }

    });

    if ((newPass.val() && confirmPass.val()) && (newPass.val() != confirmPass.val())) {
      $.toast({
        heading: 'Error',
        text: 'Пароли не совпадают',
        showHideTransition: 'fade',
        icon: 'error',
        position : 'top-right'
      });
      isValid = false;
      return false;
    }

    if (isValid) {
      var form = $('.user_password');
      $.ajax({
        url: '/settings/changePassword',
        type: 'post',
        dataType: 'json',
        data: form.serialize(),
        success: function(data) {
          if (data.error) {
            $.toast({
              heading: 'Error',
              text: data.message,
              showHideTransition: 'fade',
              icon: 'error',
              position : 'top-right'
            });
          }
          else {
            $.toast({
              text: 'Пароль успешно изменён',
              showHideTransition: 'fade',
              position : 'top-right',
              icon: 'info'
            });
            form.trigger('reset');
          }
          console.log(data);
          //form.submit();
        }
      });
    }

    return false;
  });

}); //autoRun
