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
            if ('object' === type && bean[prop] !== null) {
            	if(bean[prop] instanceof Date) {
            		ret[propname] = convertDateToStringIfNeeded(getPropValue(bean, prop));
            	}
            	else {
            		ret = getPropNamesAndValues(bean[prop], propname, ret);
            	}
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
        var $el = $(this);
        var type = getElementType($el);
        var bean = $el.data('bindData.data').bean;
        var transforms = $el.data('bindData.data').transforms;
        var propname = $el.attr('name');
        var value = null;
        switch (type) {
            case 'checkbox':
                value = $el.is(':checked');
                break;
            default:
                value = $el.val();
                break;
        }
        value = applyTransforms('get', value, getTransformsForField(propname, transforms));
        setPropValue(bean, propname, value);
        console.debug(propname + ' changed: '+value);
    };

    var resetHandler = function() {
        var form = $(this);
        setTimeout(function() {
            form.find('input,select').each(function(index, el) {
                var $el = $(el);
                var fieldValue = getFieldValue($el);
                var bean = $(this).data('bindData.data').bean;
                var propname = $(this).attr('name');
                setPropValue(bean, propname, fieldValue);
            });
            console.debug('form reset');
        }, 0);
    };

    var getTransformsForField = function(name, transforms) {
        var ret = [];
        $.each(transforms, function(index, transform) {
            if (transform.name.test(name)) {
                ret.push(transform.getset);
            }
        });
        return ret;
    };

    var applyTransforms = function(type, value, transforms) {
        var ret = value;
        $.each(transforms, function(index, transform) {
            ret = transform(type, ret);
        });
        return ret;
    };

    var setFormFields = function($form, data, transforms) {
        for (var prop in data) {
            var propTransforms = getTransformsForField(prop, transforms);
            var value = applyTransforms('set', data[prop], propTransforms);
            setFormField($form, prop, value);
        }
    };
    
    var trimTrailingZ = function(/* String */ data) {
    	var lastChar = data.substring(data.length - 1, data.length); 
    	if(lastChar == 'Z' || lastChar == 'z') {
    		return data.substring(0, data.length - 1);
    	}
    	return data;
    }
    
    var convertDateToStringIfNeeded = function(/* Date or String */ value) {
		if(typeof value == 'object') {
			if(value instanceof Date) {
				value = value.toJSON();
			}
		}
		return value;
    }

    var getFieldValue = function($el) {
        var type = getElementType($el);
        var val = null;
        switch (type) {
            case 'radio':
                if ($el.is(':checked')) {
                    val = $el.val();
                }
                else {
                    return;
                }
                break;
            case 'checkbox':
                val = $el.is(':checked');
                break;
            case 'hidden':
            case 'text':
            case 'select':
            case 'textarea':
            default:
                val = $el.val();
        }
        return val;
    };

    var getFormFields = function($form, data, transforms) {
        var getFieldData = function(index, el) {
            var $el = $(el);
            var name = $el.attr('name');
            var val = getFieldValue($el);
            val = applyTransforms('get', val, getTransformsForField(name, transforms));
            setPropValue(data, name, val);
        };
        $form.find('input,select').each(getFieldData);
    };

    var setFormField = function($form, name, value) {
        var $el = $form.find('[name="'+name+'"]');
        var type = getElementType($el);

        switch (type) {
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
			case 'date':
				var index = value.indexOf('T');
				if(index >= 0) {
					value = value.substring(0, index);
				}
				value = trimTrailingZ(value);
                $el.val(value);
				break;
			case 'time':
				var index = value.indexOf('T');
				if(index >= 0) {
					value = value.substring(index + 1);
				}
				value = trimTrailingZ(value);
                $el.val(value);
				break;
			case 'datetime-local':
				value = trimTrailingZ(value);
                $el.val(value);
				break;
            case 'hidden':
            case 'text':
            case 'select':
			case 'textarea':
            default:
                $el.val(value);
            	
        }
    };

    $.fn.binddata = function(bean, properties) {
        if (null == bean) {
            return this;
        }

        var defaultProperties = {
            bindAll: true,
            onlyGetOrSet: '',
            transforms: []
        };
        $.extend(defaultProperties, properties);
        var data = getPropNamesAndValues(bean);

        switch (defaultProperties.onlyGetOrSet) {
            case 'set':
                setFormFields(this, data, defaultProperties.transforms);
                return this;
            case 'get':
                getFormFields(this, bean, defaultProperties.transforms);
                return this;
        }

        var elData = {bean: bean, transforms: defaultProperties.transforms};

        if (defaultProperties.bindAll === false) {
            for (var prop in data) {
                var $el = this.find('[name="'+prop+'"]');
                $el.data('bindData.data', elData);
                $el.on('change', changeHandler);
            }
            setFormFields(this, data, elData.transforms);
        }
        else {
            var doBind = function(index, el) {
                var $el = $(el);
                var name = $el.attr('name');
                $el.data('bindData.data', elData);
                $el.on('change', changeHandler);
            };
            this.find('input').each(doBind);
            this.find('select').each(doBind);
            setFormFields(this, data, elData.transforms);
        }

        this.on('reset', resetHandler);

        return this;
    };
})(jQuery);
