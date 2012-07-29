(function( $ ) {
    var getPropValue = function(bean, propname) {
        var props = propname.split('.');
        var val = bean;
        for (var i = 0; i < props.length; i++) {
            val = val[props[i]];
        }
        return val;
    };

    var setPropValue = function(bean, propname, value) {
        var props = propname.split('.');
        var obj = bean;
        for (var i = 0; i < props.length; i++) {
            if (i + 1 >= props.length) {
                obj[props[i]] = value;
            }
            else {
                if (null == obj[props[i]]) {
                    obj[props[i]] = {};
                }
                obj = obj[props[i]];
            }
        }
    };

    var getPropNamesAndValues = function(bean, propPrefix, ret) {
        for (var prop in bean) {
            var propname = (propPrefix) ? propPrefix + '.' + prop : prop;
            var type = typeof(bean[prop]);
            if ('object' === type) {
                ret = getPropNamesAndValues(bean[prop], propname, ret);
            }
            else if ('function' === type) {
            }
            else {
                if (ret == null) ret = {};
                ret[propname] = getPropValue(bean, prop);
            }
        }

        return ret;
    };

    var getElementType = function($el) {
        var type = $el.attr('type');
        if (type == null) {
            type = $el[0].tagName.toLowerCase();
        }
        return type;
    };

    var changeHandler = function() {
        var type = getElementType($(this));
        var bean = $(this).data('bindData.bean');
        var propname = $(this).attr('name');
        var value = null;
        switch (type) {
            case 'checkbox':
                value = $(this).is(':checked');
                break;
            default:
                value = $(this).val();
                break;
        }
        setPropValue(bean, propname, value);
        console.log(propname + ' changed: '+value);
    };

    var setFormField = function($form, name, value) {
        var $el = $form.find('[name="'+name+'"]');
        var type = getElementType($el);

        switch (type) {
            case 'text':
            case 'select':
                $el.val(value);
                break;
            case 'radio':
                $el.filter('[value="'+value+'"]').prop('checked', true);
                break;
            case 'checkbox':
                if (true === value) {
                    $el.prop('checked', true);
                }
                else {
                    $el.prop('checked', false);
                }
                break;
        }
    };

    $.fn.binddata = function(bean, properties) {
        if (null == bean) {
            return this;
        }

        var _this = this;
        var defaultProperties = {
            bindAll: true
        };
        $.extend(defaultProperties, properties);
        var data = getPropNamesAndValues(bean);

        if (defaultProperties.bindAll === false) {
            for (var prop in data) {
                var $el = this.find('[name="'+prop+'"]');
                $el.data('bindData.bean', bean);
                $el.on('change', changeHandler);
                setFormField(this, prop, data[prop]);
            }
        }
        else {
            var doBind = function(index, el) {
                var $el = $(el);
                var name = $el.attr('name');
                $el.data('bindData.bean', bean);
                $el.on('change', changeHandler);
                if (data != null && data[name] != null) {
                    setFormField(_this, name, data[name]);
                }
            };
            this.find('input').each(doBind);
            this.find('select').each(doBind);
        }

        return this;
    };
})(jQuery);
