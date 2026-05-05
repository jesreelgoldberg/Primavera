jQuery(function ($) {
    const FORM_ID = 58;
    //let countdownTimeoutId = null;

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

    function resetCustomPages() {
        $('body').removeClass('sm-show-page-2 sm-show-page-3 returning-customer-mode');
    
        // Only hide page 1 header
        $('#strongmind-interest-form > .strongmind-ui .sm-interest-form-header').hide();
    }
    
    function showPage2() {
        $('body')
        .removeClass('sm-show-page-3')
        .addClass('sm-show-page-2');
    }
    
    function showPage3() {
        $('body')
        .removeClass('sm-show-page-2')
        .addClass('sm-show-page-3');
    }
    
    $(document).on('click', 'input.sm-interest-form-returning-customer-button:not(#next-year)', function () {
        showPage2();
    });

    $(document).on('click', '.sm-go-to-page-3', function () {
        showPage3();
    });
    
    $(document).on('click', '.sm-interest-form-back-button', function () {
        resetCustomPages();
    });

    $(document).on('click', 'button.sm-interest-form-back-button.page-3-back-button', function (e) {
        e.stopImmediatePropagation(); // stops other click handlers
        showPage2();
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

    // Prevent duplicate header on page 1 when clicking Previous buttons
    function resetReturningCustomerHeader() {
        $('body').removeClass('returning-customer-mode');
    
        // ONLY hide the page 1 header (not page 2/3)
        $('#strongmind-interest-form > .strongmind-ui .sm-interest-form-header').hide();
    }

    $(document).on('click', '#gform_previous_button_58', function () {
        resetReturningCustomerHeader();
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

    let storedPreferredStart = '';
    let storedPreferredStartSummer = '';
    let countdownIntervalId = null;

    // Capture values before submit
    $(document).on('click', '#gform_submit_button_58', function () {
        storedPreferredStart = $('#input_58_32').val()?.trim() || '';
        storedPreferredStartSummer = $('#input_58_33').val()?.trim() || '';
    });

    $(document)
    .off('gform_confirmation_loaded.myTimer')
    .on('gform_confirmation_loaded.myTimer', function (event, formId) {
        if (parseInt(formId, 10) !== 58) return;

        // Clear any previous timer just in case
        if (countdownIntervalId) {
            clearInterval(countdownIntervalId);
            countdownIntervalId = null;
        }

        const $countdownElement = $('#countdown');
        let seconds = 3;

        let redirectUrl = 'https://registration.powerschool.com/family/gosnap.aspx?action=46111&culture=en';

        if (
            storedPreferredStart === 'Fall - 26/27' ||
            (
                storedPreferredStart === 'Summer School' &&
                storedPreferredStartSummer === 'Early July Session'
            )
        ) {
            redirectUrl = 'https://registration.powerschool.com/family/gosnap.aspx?action=46634&culture=en';
        }

        // Set initial value immediately
        $countdownElement.text(seconds);

        countdownIntervalId = setInterval(function () {
            seconds--;

            if (seconds > 0) {
                $countdownElement.text(seconds);
            } else {
                clearInterval(countdownIntervalId);
                countdownIntervalId = null;
                window.location.href = redirectUrl;
            }
        }, 1000);
    });

    /* ----- 5. MOVE THE SPINNER NEXT TO THE NEXT & SUBMIT BUTTONS ----- */
    
    //const SPINNER = $('#gform_wrapper_58 #gform_ajax_spinner_58'); // the one we keep

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

});

/* Call Enrollment Number */
function callEnrollmentNumber() {
    window.location.href = 'tel:4805300632';
}