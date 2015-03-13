/*
 * jQuery.holdUp
 * $.holdUp.open(args);
 * $.holdUp.close(args);
 * $(dom).holdUp(args);
 */
(function ($) {
    $.holdUpExt = {

        defaults: {
            autoCheck: 32,
            css: {},
            size: 32,
            bgColor: '#FFF',
            bgOpacity: 0.5,
            fontColor: false,
            position: [0, 0, 0, 0],
            title: '',
            isOnly: true,
            onShow: function () {},
            onClose: function () {}
        },

        template: function (tmpl, data) {
            $.each(data, function (k, v) {
                tmpl = tmpl.replace('${' + k + '}', v);
            });
            return $(tmpl);
        },

        init: function (scope, options) {
            this.options = $.extend({}, this.defaults, options);
            this.scope = scope;

            if (this.scope.is(':hidden')) {
                return;
            }
            this.checkScope();
            this.check_position();
            this.check_unique();
            this.create();
            this.set_css();
            this.set_define();
            this.show();

            return this.loading;
        },

        checkScope: function () {
            if (!this.options.autoCheck) {
                return;
            }
            if (this.scope.is('body') || this.scope.is('div') || this.scope.is('form')) {
                this.options.size = this.options.autoCheck;
            }
            if (this.scope.is('input') || this.scope.is('button')) {
                this.options.title = '';
            }
        },

        check_position: function () {
            var pos = this.options.position;
            for (var i = 0; i < 4; i++) {
                if (pos[i] === undefined) {
                    pos[i] = 0;
                }
            }
            this.options.position = pos;
        },

        check_unique: function () {
            if (this.options.isOnly && this.loading !== undefined) {
                this.close();
            }
        },

        create: function () {
            var ops = this.options;
            this.loading = this.template($.holdUp.tmpl, {
                Class: 'x' + ops.size,
                Title: ops.title
            }).hide();
            this.loading.appendTo($('body'));
        },

        set_css: function () {
            var scope = this.scope,
                ops = this.options,
                loading = this.loading,
                height = scope.outerHeight(),
                width = scope.outerWidth(),
                top = scope.offset().top,
                left = scope.offset().left;

            loading.css('top', top);

            if (scope.is('body')) {
                var $window = $(window);
                height = $window.height();
                width = $window.width();
                loading.css('position', 'fixed');
                this.for_ie6();
            }

            loading.css({
                'height': height + ops.position[2],
                'width': width + ops.position[3],
                'left': left,
                'border-radius': scope.css('border-radius')
            }).css(ops.css);

            var loader = loading.children();
            loader.css({
                'margin-top': (height - ops.size) / 2 + ops.position[0],
                'margin-left': (width - ops.size) / 2 + ops.position[1] - loader.find('span').outerWidth() / 2
            });
        },

        set_define: function () {
            var ops = this.options,
                loading = this.loading;
            if (!ops.bgColor) {
                loading.css('background', 'none');
            } else {
                loading.css({
                    'background-color': ops.bgColor,
                    'opacity': ops.bgOpacity,
                    'filter': 'alpha(opacity=' + ops.bgOpacity * 100 + ')'
                });
            }

            ops.fontColor && loading.find('span').css('color', ops.fontColor);

            var self = this;
            $(window).resize(function () {
                self.loading && self.set_css();
            })
        },

        for_ie6: function () {
            var loading = this.loading;
            if ($.browser && $.browser.msie && $.browser.version == '6.0') {
                loading.css({
                    'position': 'absolute',
                    'top': $(window).scrollTop()
                });

                $(window).scroll(function () {
                    loading.css("top", $(window).scrollTop());
                })
            }
        },

        show: function () {
            var ops = this.options;
            this.loading.show(1, function () {
                var loader = $(this).children();
                var left = loader.css('margin-left').replace('px', '');
                loader.css('margin-left', left - loader.find('span').outerWidth() / 2);
                ops.onShow(this.loading);
            });
        },

        close: function (all) {
            if (all) {
                var className = $($.holdUp.tmpl).attr('class');
                $('.' + className).remove();
            } else {
                if (this.loading != undefined) {
                    this.loading.remove();
                    this.loading = undefined;
                }
            }
            this.options != undefined && this.options.onClose();
        }
    };

    $.holdUp = {
        tmpl: '<div class="hold-up-loading-wrapper"><div class="hold-up-loading ${Class}"><div class="img"></div><span>${Title}</span></div></div>',
        open: function (arg) {
            return $('body').holdUp(arg);
        },
        close: function (all) {
            $.holdUpExt.close(all);
        }
    };

    $.fn.holdUp = function (arg) {
        if (!$(this).size()) {
            return;
        }
        if ($.type(arg) === "string") {
            arg = {
                title: arg
            }
        }
        var dom = $(this);
        if (dom.size() > 1) {
            dom = dom.parent();
        }
        return $.holdUpExt.init(dom, arg);
    };

})(jQuery);
