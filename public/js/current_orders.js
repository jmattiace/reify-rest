$('.details-button').click(function () {
    $(this).toggleClass('green');

    var currentText = $(this).text();

    $(this).text(currentText === 'HIDE DETAILS' ? 'VIEW DETAILS': 'HIDE DETAILS');

    $(this).siblings('.closet-container-details-container').toggle();
});