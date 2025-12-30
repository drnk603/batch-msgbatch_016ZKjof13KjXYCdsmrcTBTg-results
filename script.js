(function() {
    'use strict';

    window.__app = window.__app || {};

    function debounce(func, wait) {
        var timeout;
        return function() {
            var context = this;
            var args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(function() {
                func.apply(context, args);
            }, wait);
        };
    }

    function throttle(func, limit) {
        var inThrottle;
        return function() {
            var args = arguments;
            var context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(function() { inThrottle = false; }, limit);
            }
        };
    }

    function sanitizeInput(input) {
        var div = document.createElement('div');
        div.textContent = input;
        return div.innerHTML;
    }

    function BurgerMenuModule() {
        if (window.__app.burgerInit) return;
        window.__app.burgerInit = true;

        var toggle = document.querySelector('.navbar-toggler');
        var nav = document.querySelector('#main-nav');
        var body = document.body;

        if (!toggle || !nav) return;

        var navLinks = nav.querySelectorAll('.nav-link');

        function closeMenu() {
            nav.classList.remove('show');
            toggle.setAttribute('aria-expanded', 'false');
            body.classList.remove('u-no-scroll');
            nav.style.height = '0';
        }

        function openMenu() {
            nav.classList.add('show');
            toggle.setAttribute('aria-expanded', 'true');
            body.classList.add('u-no-scroll');
            nav.style.height = 'calc(100vh - var(--header-h))';
        }

        toggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            if (nav.classList.contains('show')) {
                closeMenu();
            } else {
                openMenu();
            }
        });

        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && nav.classList.contains('show')) {
                closeMenu();
            }
        });

        document.addEventListener('click', function(e) {
            if (nav.classList.contains('show') && !nav.contains(e.target) && !toggle.contains(e.target)) {
                closeMenu();
            }
        });

        for (var i = 0; i < navLinks.length; i++) {
            navLinks[i].addEventListener('click', function() {
                if (nav.classList.contains('show')) {
                    closeMenu();
                }
            });
        }

        var resizeHandler = debounce(function() {
            if (window.innerWidth >= 1024 && nav.classList.contains('show')) {
                closeMenu();
            }
        }, 250);

        window.addEventListener('resize', resizeHandler, { passive: true });
    }

    function IntersectionObserverModule() {
        if (window.__app.observerInit) return;
        window.__app.observerInit = true;

        var observerOptions = {
            root: null,
            rootMargin: '0px 0px -100px 0px',
            threshold: 0.15
        };

        var observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        var animatedElements = document.querySelectorAll('.card, .c-card, img, .btn, .hero-section, section, .award-item, .trust-badge');

        for (var i = 0; i < animatedElements.length; i++) {
            var el = animatedElements[i];
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
            observer.observe(el);
        }
    }

    function RippleEffectModule() {
        if (window.__app.rippleInit) return;
        window.__app.rippleInit = true;

        var buttons = document.querySelectorAll('.btn, .c-button, a.nav-link, .card');

        for (var i = 0; i < buttons.length; i++) {
            buttons[i].addEventListener('mousedown', function(e) {
                var btn = this;
                var ripple = document.createElement('span');
                var rect = btn.getBoundingClientRect();
                var size = Math.max(rect.width, rect.height);
                var x = e.clientX - rect.left - size / 2;
                var y = e.clientY - rect.top - size / 2;

                ripple.style.width = ripple.style.height = size + 'px';
                ripple.style.left = x + 'px';
                ripple.style.top = y + 'px';
                ripple.style.position = 'absolute';
                ripple.style.borderRadius = '50%';
                ripple.style.background = 'rgba(255, 255, 255, 0.6)';
                ripple.style.pointerEvents = 'none';
                ripple.style.transform = 'scale(0)';
                ripple.style.animation = 'ripple-animation 0.6s ease-out';

                var style = document.createElement('style');
                style.textContent = '@keyframes ripple-animation { to { transform: scale(2.5); opacity: 0; } }';
                if (!document.querySelector('style[data-ripple]')) {
                    style.setAttribute('data-ripple', 'true');
                    document.head.appendChild(style);
                }

                if (btn.style.position !== 'absolute' && btn.style.position !== 'fixed') {
                    btn.style.position = 'relative';
                }
                btn.style.overflow = 'hidden';

                btn.appendChild(ripple);

                setTimeout(function() {
                    if (ripple.parentNode) {
                        ripple.parentNode.removeChild(ripple);
                    }
                }, 600);
            });
        }
    }

    function ScrollSpyModule() {
        if (window.__app.scrollSpyInit) return;
        window.__app.scrollSpyInit = true;

        var sections = document.querySelectorAll('section[id]');
        var navLinks = document.querySelectorAll('.nav-link[href^="#"]');

        if (sections.length === 0 || navLinks.length === 0) return;

        var scrollHandler = throttle(function() {
            var scrollPos = window.scrollY + 100;

            sections.forEach(function(section) {
                var top = section.offsetTop;
                var height = section.offsetHeight;
                var id = section.getAttribute('id');

                if (scrollPos >= top && scrollPos < top + height) {
                    navLinks.forEach(function(link) {
                        link.classList.remove('active');
                        link.removeAttribute('aria-current');
                        if (link.getAttribute('href') === '#' + id) {
                            link.classList.add('active');
                            link.setAttribute('aria-current', 'page');
                        }
                    });
                }
            });
        }, 100);

        window.addEventListener('scroll', scrollHandler, { passive: true });
    }

    function SmoothScrollModule() {
        if (window.__app.smoothScrollInit) return;
        window.__app.smoothScrollInit = true;

        document.addEventListener('click', function(e) {
            var link = e.target.closest('a[href^="#"]');
            if (!link) return;

            var href = link.getAttribute('href');
            if (href === '#' || href === '#!') return;

            var target = document.querySelector(href);
            if (!target) return;

            e.preventDefault();

            var header = document.querySelector('.l-header, header');
            var offset = header ? header.offsetHeight : 80;
            var targetPosition = target.offsetTop - offset;

            window.scrollTo({
                top: Math.max(0, targetPosition),
                behavior: 'smooth'
            });

            var nav = document.querySelector('#main-nav');
            if (nav && nav.classList.contains('show')) {
                nav.classList.remove('show');
                document.body.classList.remove('u-no-scroll');
            }
        });
    }

    function CountUpModule() {
        if (window.__app.countUpInit) return;
        window.__app.countUpInit = true;

        var counters = document.querySelectorAll('[data-count]');
        if (counters.length === 0) return;

        var observerOptions = {
            root: null,
            threshold: 0.5
        };

        var observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting && !entry.target.hasAttribute('data-counted')) {
                    entry.target.setAttribute('data-counted', 'true');
                    var target = parseInt(entry.target.getAttribute('data-count'), 10);
                    var duration = 2000;
                    var start = 0;
                    var startTime = null;

                    function animate(currentTime) {
                        if (!startTime) startTime = currentTime;
                        var progress = (currentTime - startTime) / duration;

                        if (progress < 1) {
                            var current = Math.floor(start + (target - start) * progress);
                            entry.target.textContent = current.toLocaleString();
                            requestAnimationFrame(animate);
                        } else {
                            entry.target.textContent = target.toLocaleString();
                        }
                    }

                    requestAnimationFrame(animate);
                }
            });
        }, observerOptions);

        for (var i = 0; i < counters.length; i++) {
            observer.observe(counters[i]);
        }
    }

    function FormValidationModule() {
        if (window.__app.formValidationInit) return;
        window.__app.formValidationInit = true;

        var form = document.querySelector('#contact-form');
        if (!form) return;

        var notificationContainer = document.createElement('div');
        notificationContainer.className = 'position-fixed top-0 end-0 p-3';
        notificationContainer.style.zIndex = '9999';
        document.body.appendChild(notificationContainer);

        function showNotification(message, type) {
            var alertClass = 'alert-' + (type === 'error' ? 'danger' : type);
            var alert = document.createElement('div');
            alert.className = 'alert ' + alertClass + ' alert-dismissible fade show';
            alert.style.boxShadow = 'var(--shadow-lg)';
            alert.innerHTML = sanitizeInput(message) + '<button type="button" class="btn-close" onclick="this.parentElement.remove()"></button>';
            notificationContainer.appendChild(alert);

            setTimeout(function() {
                if (alert.parentNode) {
                    alert.classList.remove('show');
                    setTimeout(function() {
                        if (alert.parentNode) {
                            notificationContainer.removeChild(alert);
                        }
                    }, 150);
                }
            }, 5000);
        }

        function clearErrors() {
            var errors = form.querySelectorAll('.invalid-feedback');
            for (var i = 0; i < errors.length; i++) {
                errors[i].remove();
            }
            var fields = form.querySelectorAll('.form-control');
            for (var j = 0; j < fields.length; j++) {
                fields[j].classList.remove('is-invalid');
            }
        }

        function showError(field, message) {
            field.classList.add('is-invalid');
            var error = document.createElement('div');
            error.className = 'invalid-feedback';
            error.style.display = 'block';
            error.textContent = message;
            field.parentNode.appendChild(error);
        }

        function validateEmail(email) {
            var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return re.test(email);
        }

        function validatePhone(phone) {
            var re = /^[\d\s\+\-\(\)]{10,20}$/;
            return re.test(phone);
        }

        function validateName(name) {
            var re = /^[a-zA-ZÀ-ÿ\s'\-]{2,50}$/;
            return re.test(name);
        }

        function validateMessage(message) {
            return message.length >= 10;
        }

        form.addEventListener('submit', function(e) {
            e.preventDefault();
            clearErrors();

            var nameField = document.getElementById('name');
            var emailField = document.getElementById('email');
            var phoneField = document.getElementById('phone');
            var messageField = document.getElementById('message');
            var privacyField = document.getElementById('privacy-consent');

            var isValid = true;

            if (!nameField.value.trim()) {
                showError(nameField, 'Bitte geben Sie Ihren Namen ein.');
                isValid = false;
            } else if (!validateName(nameField.value.trim())) {
                showError(nameField, 'Name darf nur Buchstaben, Leerzeichen, Apostrophe und Bindestriche enthalten (2-50 Zeichen).');
                isValid = false;
            }

            if (!emailField.value.trim()) {
                showError(emailField, 'Bitte geben Sie Ihre E-Mail-Adresse ein.');
                isValid = false;
            } else if (!validateEmail(emailField.value.trim())) {
                showError(emailField, 'Bitte geben Sie eine gültige E-Mail-Adresse ein.');
                isValid = false;
            }

            if (!phoneField.value.trim()) {
                showError(phoneField, 'Bitte geben Sie Ihre Telefonnummer ein.');
                isValid = false;
            } else if (!validatePhone(phoneField.value.trim())) {
                showError(phoneField, 'Bitte geben Sie eine gültige Telefonnummer ein (10-20 Zeichen).');
                isValid = false;
            }

            if (!messageField.value.trim()) {
                showError(messageField, 'Bitte geben Sie eine Nachricht ein.');
                isValid = false;
            } else if (!validateMessage(messageField.value.trim())) {
                showError(messageField, 'Die Nachricht muss mindestens 10 Zeichen lang sein.');
                isValid = false;
            }

            if (!privacyField.checked) {
                showError(privacyField, 'Bitte akzeptieren Sie die Datenschutzerklärung.');
                isValid = false;
            }

            if (!isValid) {
                showNotification('Bitte korrigieren Sie die Fehler im Formular.', 'error');
                return;
            }

            var submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = true;
                var originalText = submitBtn.textContent;
                submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Wird gesendet...';
            }

            setTimeout(function() {
                var success = Math.random() > 0.1;

                if (success) {
                    showNotification('Ihre Nachricht wurde erfolgreich gesendet!', 'success');
                    setTimeout(function() {
                        window.location.href = 'thank_you.html';
                    }, 1000);
                } else {
                    showNotification('Verbindungsfehler. Bitte versuchen Sie es später erneut.', 'error');
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.textContent = originalText;
                    }
                }
            }, 1500);
        });
    }

    function NewsletterFormModule() {
        if (window.__app.newsletterInit) return;
        window.__app.newsletterInit = true;

        var forms = document.querySelectorAll('.newsletter-form');
        if (forms.length === 0) return;

        for (var i = 0; i < forms.length; i++) {
            forms[i].addEventListener('submit', function(e) {
                e.preventDefault();
                var input = this.querySelector('input[type="email"]');
                var email = input.value.trim();

                var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!email || !re.test(email)) {
                    alert('Bitte geben Sie eine gültige E-Mail-Adresse ein.');
                    return;
                }

                var btn = this.querySelector('button[type="submit"]');
                if (btn) {
                    btn.disabled = true;
                    var originalText = btn.textContent;
                    btn.textContent = 'Wird gesendet...';

                    setTimeout(function() {
                        alert('Vielen Dank! Sie wurden erfolgreich angemeldet.');
                        input.value = '';
                        btn.disabled = false;
                        btn.textContent = originalText;
                    }, 1000);
                }
            });
        }
    }

    function ScrollToTopModule() {
        if (window.__app.scrollTopInit) return;
        window.__app.scrollTopInit = true;

        var btn = document.createElement('button');
        btn.className = 'scroll-to-top';
        btn.innerHTML = '↑';
        btn.setAttribute('aria-label', 'Nach oben scrollen');
        btn.style.cssText = 'position: fixed; bottom: 30px; right: 30px; width: 50px; height: 50px; background: linear-gradient(135deg, var(--color-primary), var(--color-accent-hover)); color: white; border: none; border-radius: 50%; font-size: 24px; cursor: pointer; opacity: 0; transition: opacity 0.3s ease-in-out, transform 0.3s ease-in-out; z-index: 1000; box-shadow: var(--shadow-lg);';

        document.body.appendChild(btn);

        var scrollHandler = throttle(function() {
            if (window.scrollY > 300) {
                btn.style.opacity = '1';
                btn.style.transform = 'scale(1)';
            } else {
                btn.style.opacity = '0';
                btn.style.transform = 'scale(0.8)';
            }
        }, 100);

        window.addEventListener('scroll', scrollHandler, { passive: true });

        btn.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });

        btn.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.15)';
        });

        btn.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
    }

    function ImageOptimizationModule() {
        if (window.__app.imageOptInit) return;
        window.__app.imageOptInit = true;

        var images = document.querySelectorAll('img');

        for (var i = 0; i < images.length; i++) {
            var img = images[i];

            if (!img.hasAttribute('loading') && !img.classList.contains('c-logo__img')) {
                img.setAttribute('loading', 'lazy');
            }

            if (!img.classList.contains('img-fluid')) {
                img.classList.add('img-fluid');
            }

            img.addEventListener('error', function() {
                this.src = 'data:image/svg+xml;base64,' + btoa(
                    '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200">' +
                    '<rect width="100%" height="100%" fill="#f8f9fa"/>' +
                    '<text x="50%" y="50%" font-family="Arial" font-size="14" fill="#6c757d" text-anchor="middle" dy=".3em">Bild nicht verfügbar</text>' +
                    '</svg>'
                );
            });
        }
    }

    function CardHoverModule() {
        if (window.__app.cardHoverInit) return;
        window.__app.cardHoverInit = true;

        var cards = document.querySelectorAll('.card, .c-card, .award-item, .trust-badge');

        for (var i = 0; i < cards.length; i++) {
            var card = cards[i];
            card.style.transition = 'all 0.4s ease-in-out';

            card.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-10px) scale(1.02)';
                this.style.boxShadow = '0 12px 40px rgba(255, 107, 53, 0.25)';
            });

            card.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0) scale(1)';
                this.style.boxShadow = 'var(--shadow-sm)';
            });
        }
    }

    function PrivacyModalModule() {
        if (window.__app.privacyModalInit) return;
        window.__app.privacyModalInit = true;

        var privacyLinks = document.querySelectorAll('a[href*="privacy"]');

        for (var i = 0; i < privacyLinks.length; i++) {
            privacyLinks[i].addEventListener('click', function(e) {
                if (this.getAttribute('href').indexOf('privacy') !== -1 && this.getAttribute('target') !== '_blank') {
                    return;
                }
            });
        }
    }

    window.__app.init = function() {
        BurgerMenuModule();
        IntersectionObserverModule();
        RippleEffectModule();
        ScrollSpyModule();
        SmoothScrollModule();
        CountUpModule();
        FormValidationModule();
        NewsletterFormModule();
        ScrollToTopModule();
        ImageOptimizationModule();
        CardHoverModule();
        PrivacyModalModule();
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', window.__app.init);
    } else {
        window.__app.init();
    }

})();