jQuery(($) => {
    const FORM_ID = 58;
    const TARGET_PAGE = 2;
    const INJECT_ID = 'field_58_26';
    const MARKUP = `
<div id="field_58_26" class="gfield gfield--type-html gfield--input-type-html gfield--width-full gfield_html gfield_html_formatted gfield_no_follows_desc field_sublabel_below gfield--no-description field_description_below field_validation_below gfield_visibility_visible">
  <p class="new-student">
    Already started a <span style="font-style: italic;">new student</span> application with Primavera? To return to an existing PowerSchool application,
    <a href="https://registration.powerschool.com/family/gosnap.aspx?action=46111&amp;culture=en" target="_blank" rel="noopener noreferrer">click here</a>
  </p>
</div>`;

    /* helper that only invokes callback when our form fires gform_page_loaded */
    const onFormPageLoaded = (cb) =>
        $(document).on('gform_page_loaded', (_e, formId, currentPage) => {
            if (parseInt(formId, 10) === FORM_ID) cb(currentPage);
        });

    /* 1 - Next button wrapper */
    const wrapNextButton = () => {
        const btn = document.getElementById('gform_next_button_58_29');
        if (!btn) return;

        let wrapper = btn.parentNode;
        if (!wrapper.classList.contains('brand-new-enroll-container')) {
            wrapper = document.createElement('div');
            wrapper.className = 'brand-new-enroll-container';
            btn.parentNode.insertBefore(wrapper, btn);
            wrapper.appendChild(btn);
        }

        if (!wrapper.querySelector('p.brand-new-enroll')) {
            const p = document.createElement('p');
            p.className = 'brand-new-enroll';
            p.textContent = "I've never submitted an application";
            wrapper.appendChild(p);
        }
    };

    /* 2 - Move previous button to top */
    const movePrevButton = () => {
        const $prev = $('#gform_previous_button_58');
        if (!$prev.length) return;

        const $page = $prev.closest('.gform_page');
        if (!$page.length) return;

        let $container = $page.find('.gf-prev-top-container');
        if (!$container.length) {
            $container = $('<div class="gf-prev-top-container"></div>');
            $page.prepend($container);
        }
        $container.append($prev);
    };

    /* 3 - Interest container sync */
    const syncInterestContainer = (page) => {
        const p = parseInt(page, 10);
        $('.sm-interest-form-container')
            .stop(true, true)
            .fadeToggle(p === 1, 150);
    };

    /* 4 - Update form title quickly */
    const updateGFTitleFast = () => {
        const $t = $('#gform_wrapper_58 .gform_title');
        if (!$t.length) return;
        $t.text("Let's Get Started!");
        $('body').addClass('gf58-title-ready');
    };

    /* 5 - Spinner movement */
    const moveSpinnerNextTo = ($btn) => {
        const $spinner = $('#gform_wrapper_58 #gform_ajax_spinner_58');
        if (!$spinner.length || !$btn.length) return;
        $btn.after($spinner);
    };

    /* 6 - page 2 html injection */
    const injectHtmlIfNeeded = (currentPage) => {
        const page = parseInt(currentPage, 10);
        const $existing = $('#' + INJECT_ID);
        if (page === TARGET_PAGE) {
            if ($existing.length) return; // already injected
            const $submit = $('#gform_submit_button_58');
            if (!$submit.length) return;
            const $anchor = $submit.closest('.submit-form-powerschool').length ? $submit.closest('.submit-form-powerschool') : $submit;
            $anchor.after(MARKUP);
        } else if ($existing.length) {
            $existing.remove();
        }
    };

    /* 7 - confirmation redirect countdown */
    let countdownTimeoutId = null;
    $(document)
        .off('gform_confirmation_loaded.myTimer')
        .on('gform_confirmation_loaded.myTimer', (_e, formId) => {
            if (parseInt(formId, 10) !== FORM_ID) return;
            if (countdownTimeoutId) clearTimeout(countdownTimeoutId);
            const $count = $('#countdown').text(3);
            const pref = $('#input_58_32').val();
            let redirectUrl = 'https://registration.powerschool.com/family/gosnap.aspx?action=46111&culture=en';
            if (pref === 'Fall - 26/27') {
                redirectUrl = 'https://registration.powerschool.com/family/gosnap.aspx?action=46634&culture=en';
            }
            const tick = () => {
                let secs = parseInt($count.text(), 10);
                if (--secs > 0) {
                    $count.text(secs);
                    countdownTimeoutId = setTimeout(tick, 1000);
                } else {
                    window.location.href = redirectUrl;
                }
            };
            countdownTimeoutId = setTimeout(tick, 1000);
        });

    /* 8 - returning customer UI */
    $(document).on('click', 'input.sm-interest-form-returning-customer-button', () => {
        $('#gform_wrapper_58').hide().fadeOut(150);
        $('body').addClass('returning-customer-mode');
    });
    $(document).on('click', '.sm-interest-form-back-button', () => {
        $('#gform_wrapper_58').css('display', 'block').hide().fadeIn(200);
        $('body').removeClass('returning-customer-mode');
    });

    /* 9 - spinner button clicks */
    $(document).on('click',
        '#gform_previous_button_58, #gform_previous_button_58_29, #gform_next_button_58_29, #gform_submit_button_58',
        function () {
            moveSpinnerNextTo($(this));
        });

    /* initialization */
    wrapNextButton();
    movePrevButton();
    const initialPage = $('#gform_source_page_number_' + FORM_ID).val();
    if (initialPage) {
        syncInterestContainer(initialPage);
        injectHtmlIfNeeded(initialPage);
    }
    updateGFTitleFast();

    /* handle page transitions */
    onFormPageLoaded((cur) => {
        setTimeout(wrapNextButton, 50);
        setTimeout(movePrevButton, 50);
        syncInterestContainer(cur);
        $('body').removeClass('gf58-title-ready');
        updateGFTitleFast();
        requestAnimationFrame(updateGFTitleFast);
        setTimeout(updateGFTitleFast, 0);
        injectHtmlIfNeeded(cur);
    });

    /* extra safety on previous click */
    $(document).on('click', '#gform_previous_button_58, #gform_previous_button_58_29', () => {
        setTimeout(wrapNextButton, 100);
    });

    /* mutation observer fallback for wrapNextButton */
    const formEl = document.getElementById('gform_58');
    if (formEl && window.MutationObserver) {
        const ob = new MutationObserver(() => {
            const btn = document.getElementById('gform_next_button_58_29');
            if (btn && !btn.parentNode.classList.contains('brand-new-enroll-container')) {
                wrapNextButton();
            }
        });
        ob.observe(formEl, { childList: true, subtree: true });
    }
});
