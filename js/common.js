(function ($) {
    $(document).ready(function () {
        document.body.style.opacity = 1;
        document.body.style.overflowX = 'auto';

        var submitJobBtn = $('.find-jobs'),
            submitResumeBtn = $('.find-candidates'),
            searchResumeInput = $('.search-resume'),
            locationInput = $('.search-location'),
            locationInputResult = $('.search-location-result'),
            searchJobResult = $('.search-join-result'),
            searchJobInput = $('.search-job'),
            sendJobString = '/app/jobs/search?query={"value":"',
            sendResumeString = '/app/resumes/search?query=',
            sendLocationPlaceName = '',
            sendLocationCountryCode = '',
            sendLocationPostal = '';

        submitJobBtn.on('click', function (e) {
            e.preventDefault();
            if (searchJobInput.val() && locationInput.val()) {
                window.location.assign(sendJobString + searchJobInput.val() + '","label":"' + searchJobInput.val() + ' "}&region={"postalCode":"' + sendLocationPostal + '","placeName":"' + sendLocationPlaceName + '","countryCode":"' + sendLocationCountryCode + '"}');
            } else if (searchJobInput.val() || locationInput.val()) {
                searchJobInput.val() ?
                    window.location.assign(sendJobString + searchJobInput.val() + '","label":"' + searchJobInput.val() + ' "}&page=1')
                    : window.location.assign('/app/jobs/search?region={"postalCode":"' + sendLocationPostal + '","placeName":"' + sendLocationPlaceName + '","countryCode":"' + sendLocationCountryCode + '"}');
            }
        });

        submitResumeBtn.on('click', function (e) {
            e.preventDefault();
            if (searchResumeInput.val() && locationInput.val()) {
                window.location.assign(sendResumeString + searchResumeInput.val() + '&region={"postalCode":"' + sendLocationPostal + '","placeName":"' + sendLocationPlaceName + '","countryCode":"' + sendLocationCountryCode + '"}');
            } else if (searchResumeInput.val() || locationInput.val()) {
                searchResumeInput.val() ?
                    window.location.assign(sendResumeString + searchResumeInput.val())
                    : window.location.assign('/app/resumes/search?region={"postalCode":"' + sendLocationPostal + '","placeName":"' + sendLocationPlaceName + '","countryCode":"' + sendLocationCountryCode + '"}');
            }
        });

        locationInput.on('input', function (el) {
            $.ajax({
                url: "/geonames/api/v1/postalCodeSearch?code=" + locationInput.val() + "&limit=10&offset=0&ts=1537243225989",
                type: "GET",
                success: function (data) {
                    if (locationInput.val().length) {

                        locationInputResult.css("display", "block");
                        var queryResult = $('<div></div>');
                        data.forEach(function (el) {
                            queryResult.append(
                                '<span class="margin-bottom-10 pointer btn-block" data-place-name="' + el.placeName + '" data-place-postal="' + el.postalCode + '" data-place-country="' + el.countryCode + '">' +
                                el.placeName + ' ' + el.postalCode + ', ' + el.countryCode + '<br>'
                                + '</span>'
                            );
                        });
                        if (data.length) {
                            locationInputResult.html(queryResult);
                            locationInputResult.on('click', 'span', function (el) {
                                el.preventDefault(); el.stopPropagation();
                                locationInput.val($(this)[0].dataset.placeName + ' ' + $(this)[0].dataset.placePostal + ', ' + $(this)[0].dataset.placeCountry);
                                sendLocationPlaceName = $(this)[0].dataset.placeName;
                                sendLocationPostal = $(this)[0].dataset.placePostal;
                                sendLocationCountryCode = $(this)[0].dataset.placeCountry;
                                locationInputResult.css("display", "none");
                            });

                        } else {
                            locationInputResult.html('Nothing found');
                        }

                    } else {
                        locationInputResult.css("display", "none");
                    }
                }
            });
        });

        searchJobInput.on('input', function (el) {
            $.ajax({
                url: "/api/Job/search?query=" + searchJobInput.val(),
                type: "GET",
                success: function (data) {
                    if (searchJobInput.val().length) {
                        searchJobResult.css("display", "block");
                        var queryResult = $('<div></div>');
                        data.content.forEach(function (el) {
                            queryResult.append(
                                '<span class="margin-bottom-10 pointer btn-block" data-title="' + el.title + '">' +
                                (el.title ? el.title + ' - ' : '') + '<span class="small text-muted">' + el.title + '</span>' + '<br>'
                                + '</span>'
                            );
                        });
                        if (data.content.length) {
                            searchJobResult.html(queryResult);
                            searchJobResult.on('click', 'span', function (el) {
                                el.preventDefault(); el.stopPropagation();
                                searchJobInput.val($(this)[0].dataset.title);
                                searchJobResult.css("display", "none");
                            });

                        } else {
                            searchJobResult.html('Nothing found');
                        }

                    } else {
                        searchJobResult.css("display", "none");
                    }
                }
            });
        });

        var userForm = $('#login-form');
        var companyForm = $('#company-form');

        function registerForm(e, that) {
            e.preventDefault(); // avoid to execute the actual submit of the form.

            var form = $(that);
            var apiUrl = '/api/';
            var signupUrl = apiUrl + 'account/signup';
            var userData = {};


            $.each(that.elements, function (i, v) {
                var input = $(v);
                if (input.attr("type") !== 'checkbox' && input.attr("type") !== 'submit') {
                    userData[input.attr("name")] = input.val();
                }
                delete userData["undefined"];
            });

            $.ajax({
                url: signupUrl,
                type: "POST",
                contentType: "application/json; charset=utf-8",
                dataType: 'json',
                data: JSON.stringify(userData), // serializes the form's elements.
                success: function (data) {
                    //console.log(data);
                    var TOKEN_STORAGE_NAME = 'authorization_token';
                    var REFRESH_TOKEN_STORAGE_NAME = 'refresh_authorization_token';
                    var EXPIRATION_TOKEN_DATE = 'expiration_token_date';

                    function saveToken(token) {
                        localStorage.setItem(EXPIRATION_TOKEN_DATE, new Date(Date.now() + 1000 * token.expires_in).toString());
                        localStorage.setItem(TOKEN_STORAGE_NAME, 'Bearer ' + token.access_token);
                        localStorage.setItem(REFRESH_TOKEN_STORAGE_NAME, token.refresh_token);
                    }

                    console.log(typeof data);

                    saveToken(data);

                    window.location.replace("/app/my");
                },
                error: function (err) {
                    console.log(JSON.parse(err.responseText));
                    $.each(JSON.parse(err.responseText), function (key, val) {
                        console.log(form.find('#' + key.charAt(0).toLowerCase() + key.slice(1)));
                        form
                            .find('#' + key.charAt(0).toLowerCase() + key.slice(1))
                            .parent()
                            .addClass('has-error');
                    })
                }
            });
        }
        userForm.submit(function (e) {
            $this = this;
            registerForm(e, $this);
        });
        companyForm.submit(function (e) {
            $this = this;
            registerForm(e, $this);
        });

        var h = $("#company-video");
        var g = $("#video-thumbnail");
        var m = $("#play-btn");

        h.on("canplay", function () {
            g[0].style.zIndex = "-1";
        });
        h.on("play", function () {
            m[0].style.display = "none", h[0].controls = !0;
        });
        h.on("pause", function () {
            m[0].style.display = "block", h[0].controls = !1;
        });
        m.on("click", function () {
            h[0].play();
        });

    });

})(jQuery);
