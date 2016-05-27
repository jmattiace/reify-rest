$(document).ready(function() {
    function close_accordion_section() {
        $('.faq-accordion .faq-text-item').removeClass('active');
        $('.faq-accordion .faq-section-content').slideUp(300).removeClass('open');
    }

    $('.faq-text-item').click(function(e) {
        // Grab current anchor value
        var currentAttrValue = $(this).attr('href');

        if($(e.target).is('.active')) {
            close_accordion_section();
        }else {
            close_accordion_section();

            // Add active class to section title
            $(this).addClass('active');
            // Open up the hidden content panel
            $('.faq-accordion ' + currentAttrValue).slideDown(300).addClass('open');
        }

        e.preventDefault();
    });
});