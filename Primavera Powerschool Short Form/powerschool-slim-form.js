jQuery(function ($) {
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

    /* ----- 1. WRAP NEXT BUTTON AND ADD "I've never submitted an application" TEXT ----- */
    function wrapNextButton() {
    var btn = document.getElementById("gform_next_button_58_29");

    if (btn) {
            // Create wrapper if missing
        if (!btn.parentNode.classList.contains("brand-new-enroll-container")) {
                var wrapper = document.createElement("div");
                wrapper.className = "brand-new-enroll-container";

                btn.parentNode.insertBefore(wrapper, btn);
                wrapper.appendChild(btn);
            }

            // At this point, wrapper definitely exists
            var wrapperDiv = btn.parentNode;

            // Add paragraph if it doesn't exist yet
            if (!wrapperDiv.querySelector("p.brand-new-enroll")) {
                var p = document.createElement("p");
                p.className = "brand-new-enroll";
                p.textContent = "I've never submitted an application";
                wrapperDiv.appendChild(p);
            }
        }
    }

    // 1) Initial run
    wrapNextButton();

    // 2) Run on any Gravity Forms page load (Next/Previous, etc.)
    $(document).on("gform_page_loaded", function (event, form_id, current_page) {
        if (form_id === 58) {
            // Small delay to ensure GF has finished rendering
            setTimeout(wrapNextButton, 50);
        }
    });

    // 3) Extra safety: run after clicking the Previous button
    // (covers cases where gform_page_loaded might behave unexpectedly)
    $(document).on("click", "#gform_previous_button_58, #gform_previous_button_58_29", function () {
        setTimeout(wrapNextButton, 100);
    });

    // 4) Last line of defense: watch the form for DOM changes
    var form = document.getElementById("gform_58");
    if (form && "MutationObserver" in window) {
        var observer = new MutationObserver(function (mutations) {

            // If our button reappears without the wrapper, fix it
            var btn = document.getElementById("gform_next_button_58_29");
            if (btn && !btn.parentNode.classList.contains("brand-new-enroll-container")) {
                wrapNextButton();
            }
        });

        observer.observe(form, {
            childList: true,
            subtree: true
        });
    }

    /* ----- 2. MOVE PREVIOUS BUTTON TO TOP OF PAGE ----- */
    function movePrevButton58() {
        var $prevBtn = $('#gform_previous_button_58');
        if (!$prevBtn.length) return;

        // Find the current GF page that contains this Previous button
        var $page = $prevBtn.closest('.gform_page');
        if (!$page.length) return;

        // Create a top container if it doesn't exist yet
        var $topContainer = $page.find('.gf-prev-top-container');
        if (!$topContainer.length) {
            $topContainer = $('<div class="gf-prev-top-container"></div>');

            // Put it at the very top of the page content
            $page.prepend($topContainer);
        }

        // Move the Previous button into the top container
        $topContainer.append($prevBtn);
    }

    // Initial run
    movePrevButton58();

    // Run again after any Gravity Forms page change (Next/Previous)
    $(document).on('gform_page_loaded', function (event, form_id, current_page) {
        if (form_id === 58) {
            setTimeout(movePrevButton58, 50); // wait for GF to finish rendering
        }
    });

    /* ----- 3. BEHAVIOR UPDATES + REDIRECT WITH COUNTDOWN (runs on confirmation) ----- */
    /* ------------------------------
       A) Seamless page transitions:
          Control .sm-interest-form-container ONLY after GF finishes loading
       ------------------------------ */
    function syncInterestContainer(currentPage) {
        const page = parseInt(currentPage, 10);
        if (page === 1) {
            $('.sm-interest-form-container').stop(true, true).fadeIn(150);
        } else {
            $('.sm-interest-form-container').stop(true, true).fadeOut(150);
        }
    }

    // Initial state (in case page loads mid-form)
    const initialPage = $('#gform_source_page_number_' + FORM_ID).val();
    if (initialPage) {
        syncInterestContainer(initialPage);
    }

    // Update ONLY after GF page load (prevents premature disappearing)
    $(document).on('gform_page_loaded', function (event, form_id, current_page) {
        if (parseInt(form_id, 10) !== FORM_ID) return;
        syncInterestContainer(current_page);
    });

    /* ------------------------------
       B) Returning customer flow: Hide/show the Gravity Forms wrapper
       ------------------------------ */
    $(document).on('click', 'input.sm-interest-form-returning-customer-button', function () {
        $('#gform_wrapper_58').hide().fadeOut(150);
    });

    $(document).on('click', '.sm-interest-form-back-button', function () {
        $('#gform_wrapper_58')
            .css('display', 'block')
            .hide()
            .fadeIn(200);
    });

    /* ------------------------------
       C) Update the GF title (runs on load + after page changes)
       ------------------------------ */
    function updateGFTitleFast() {
        const $title = $('#gform_wrapper_58 .gform_title');
        if (!$title.length) return;

        // Set text immediately
        $title.text("Let's Get Started!");

        // Mark as ready so CSS reveals it (prevents flash)
        $('body').addClass('gf58-title-ready');
    }

    // Run ASAP on initial load
    updateGFTitleFast();

    // Run after GF transitions (try multiple immediate passes instead of setTimeout)
    $(document).on('gform_page_loaded', function (event, form_id) {
        if (parseInt(form_id, 10) !== FORM_ID) return;

        // Remove ready, hide title again until we reset it
        $('body').removeClass('gf58-title-ready');

        // Update as soon as possible
        updateGFTitleFast();
        requestAnimationFrame(updateGFTitleFast);
        setTimeout(updateGFTitleFast, 0);
    });

    // When RETURNING CUSTOMER button is clicked
    $(document).on('click', 'input.sm-interest-form-returning-customer-button', function () {
        $('body').addClass('returning-customer-mode');
    });

    // When BACK button is clicked
    $(document).on('click', '.sm-interest-form-back-button', function () {
        $('body').removeClass('returning-customer-mode');
    });

    /* ------------------------------
       D) REDIRECT WITH COUNTDOWN (runs on confirmation)
       ------------------------------ */
    let countdownTimeoutId = null;
    $(document)
        .off('gform_confirmation_loaded.myTimer')
        .on('gform_confirmation_loaded.myTimer', function (event, formId) {

        if (parseInt(formId, 10) !== 58) return;

        // If a previous countdown is still running, stop it
        if (countdownTimeoutId) {
            clearTimeout(countdownTimeoutId);
            countdownTimeoutId = null;
        }

        const $countdownElement = $('#countdown');
        let seconds = 3;

        // Make sure the initial number is set by JS (prevents stale HTML)
        $countdownElement.text(seconds);

        const preferredStart = $('#input_58_32').val();

        let redirectUrl = 'https://registration.powerschool.com/family/gosnap.aspx?action=46111&culture=en';
        if (preferredStart === 'Fall - 26/27') {
            redirectUrl = 'https://registration.powerschool.com/family/gosnap.aspx?action=46634&culture=en';
        }

        function tick() {
            seconds -= 1;

            if (seconds > 0) {
            $countdownElement.text(seconds);
            countdownTimeoutId = setTimeout(tick, 1000);
            } else {
            window.location.href = redirectUrl;
            }
        }

        // Start after 1 second so it shows "3" for a full second
        countdownTimeoutId = setTimeout(tick, 1000);
    });

    /* ----- 5. MOVE THE SPINNER NEXT TO THE NEXT & SUBMIT BUTTONS ----- */
    
    const SPINNER = $('#gform_wrapper_58 #gform_ajax_spinner_58'); // the one we keep

    function moveSpinnerNextTo($btn) {
        const $spinner = $('#gform_wrapper_58 #gform_ajax_spinner_58');
        if (!$spinner.length || !$btn.length) return;

        // Move the spinner element next to the clicked button
        $btn.after($spinner);
    }

    $(document).on('click', '#gform_previous_button_58', function () {
        moveSpinnerNextTo($(this));
    });
    $(document).on('click', '#gform_next_button_58_29', function () {
        moveSpinnerNextTo($(this));
    });
    $(document).on('click', '#gform_submit_button_58', function () {
        moveSpinnerNextTo($(this));
    });

    /* ----- 6. ADD RETURNING APPLICANT VERBAGE IN FORM FOOTER ON PAGE 2 ----- */

    function injectHtmlIfNeeded(currentPage) {
    const $existing = $('#' + INJECT_ID);

    // Only show on page 2
    if (parseInt(currentPage, 10) === TARGET_PAGE) {

        // Prevent duplicates
        if ($existing.length) return;

        const $submit = $('#gform_submit_button_58');
        if (!$submit.length) return;

        const $anchor = $submit.closest('.submit-form-powerschool').length
            ? $submit.closest('.submit-form-powerschool')
            : $submit;

        if ($anchor.length) {
            $anchor.after(MARKUP);
        }
        } else {
            // Remove when leaving page 2
            if ($existing.length) {
                $existing.remove();
            }
        }
    }

    // Initial check (in case page 2 is loaded directly)
    const initialPage2 = $('#gform_source_page_number_' + FORM_ID).val();
    if (initialPage2) {
        injectHtmlIfNeeded(initialPage);
    }

    // Primary trigger: page changes
    $(document).on('gform_page_loaded', function (event, form_id, current_page) {
        if (parseInt(form_id, 10) === FORM_ID) {
            setTimeout(() => injectHtmlIfNeeded(current_page), 50);
        }
    });
});